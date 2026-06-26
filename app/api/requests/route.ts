import { NextResponse } from "next/server";
import { db } from "@/db";
import { request as requestsTable, slot, user, band, userBand } from "@/db/schema";
import { eq, and, or, lt, gt, gte, lte, asc, desc, sql } from "drizzle-orm";

async function getFirstBandId(userId: string): Promise<string | null> {
  const rows = await db
    .select({ band_id: userBand.band_id })
    .from(userBand)
    .where(eq(userBand.user_id, userId))
    .orderBy(asc(userBand.band_id))
    .limit(1);
  return rows[0]?.band_id ?? null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get("room_id");
    const user_id = searchParams.get("user_id");

    const filters = [];
    if (room_id) filters.push(eq(requestsTable.room_id, room_id));
    if (user_id) filters.push(eq(requestsTable.user_id, user_id));

    const requests = await db
      .select({
        id: requestsTable.id,
        user_id: requestsTable.user_id,
        status: requestsTable.status,
        slot_start: requestsTable.slot_start,
        slot_end: requestsTable.slot_end,
        request_date: requestsTable.request_date,
        response_date: requestsTable.response_date,
        slot_id: requestsTable.slot_id,
        room_id: requestsTable.room_id,
        band_id: requestsTable.band_id,
        reason: requestsTable.reason,
        user_name: user.name,
        band_name: band.name,
      })
      .from(requestsTable)
      .leftJoin(user, eq(requestsTable.user_id, user.id))
      .leftJoin(band, eq(requestsTable.band_id, band.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(requestsTable.request_date));

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, room_id, band_id, reason } = body;

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ message: "user_id is required" }, { status: 400 });
    }
    if (!room_id || typeof room_id !== "string") {
      return NextResponse.json({ message: "room_id is required" }, { status: 400 });
    }
    if (!body.slot_start || !body.slot_end) {
      return NextResponse.json({ message: "slot_start and slot_end are required" }, { status: 400 });
    }

    const slot_start = new Date(body.slot_start);
    const slot_end = new Date(body.slot_end);

    if (isNaN(slot_start.getTime()) || isNaN(slot_end.getTime())) {
      return NextResponse.json({ message: "Invalid slot_start or slot_end" }, { status: 400 });
    }

    const [userRecord] = await db.select().from(user).where(eq(user.id, user_id)).limit(1);
    if (!userRecord) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    const userBandId = userRecord ? await getFirstBandId(userRecord.id) : null;
    const bandIdToUse = band_id || userBandId;

    const newRequest = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM room WHERE id = ${room_id} FOR UPDATE`);

      const [existingPendingRequest] = await tx
        .select()
        .from(requestsTable)
        .where(
          and(
            eq(requestsTable.band_id, bandIdToUse),
            eq(requestsTable.room_id, room_id),
            eq(requestsTable.status, "pending"),
            or(
              and(lt(requestsTable.slot_start, slot_end), gt(requestsTable.slot_end, slot_start)),
              and(gte(requestsTable.slot_start, slot_start), lte(requestsTable.slot_end, slot_end))
            )
          )
        )
        .limit(1);

      if (existingPendingRequest) {
        const [bandRecord] = await tx.select().from(band).where(eq(band.id, bandIdToUse)).limit(1);
        const bandName = bandRecord ? bandRecord.name : "this profile";
        throw new Error(
          `CONFLICT: There's already a pending request for ${bandName} in this time slot`
        );
      }

      const [existingSlot] = await tx
        .select()
        .from(slot)
        .where(
          and(
            eq(slot.room_id, room_id),
            eq(slot.status, "booked"),
            or(
              and(lt(slot.slot_start, slot_end), gt(slot.slot_end, slot_start)),
              and(gte(slot.slot_start, slot_start), lte(slot.slot_end, slot_end))
            )
          )
        )
        .limit(1);

      if (existingSlot) {
        let bandName = "another profile";
        if (existingSlot.band_id) {
          const [bandRecord] = await tx.select().from(band).where(eq(band.id, existingSlot.band_id)).limit(1);
          bandName = bandRecord ? bandRecord.name : "another profile";
        }
        throw new Error(
          `CONFLICT: This time slot is already booked by ${bandName}. Please choose a different time or room.`
        );
      }

      const [inserted] = await tx
        .insert(requestsTable)
        .values({
          user_id,
          status: "pending",
          slot_start,
          slot_end,
          room_id,
          band_id: bandIdToUse,
          reason,
        })
        .returning();

      return inserted;
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("CONFLICT:")) {
      return NextResponse.json({ message: error.message.slice(9) }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ message: "Error creating request" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const [requestToUpdate] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!requestToUpdate) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    const prevStatus = requestToUpdate.status;
    const prevSlotId = requestToUpdate.slot_id;

    const body = await req.json();
    const updateData: Record<string, any> = { ...body };

    // Convert string timestamps to Date objects
    for (const field of ["slot_start", "slot_end", "request_date", "response_date"]) {
      if (typeof updateData[field] === "string") updateData[field] = new Date(updateData[field]);
    }

    if (updateData.status === "approved") {
      const adjustedSlotStart = updateData.slot_start || requestToUpdate.slot_start;
      const adjustedSlotEnd = updateData.slot_end || requestToUpdate.slot_end;

      if (updateData.user_id === undefined || updateData.user_id === "") {
        delete updateData.user_id;
      }

      await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT id FROM room WHERE id = ${requestToUpdate.room_id} FOR UPDATE`);

        const [overlappingSlot] = await tx
          .select()
          .from(slot)
          .where(
            and(
              eq(slot.room_id, requestToUpdate.room_id),
              or(
                and(lt(slot.slot_start, adjustedSlotEnd), gt(slot.slot_end, adjustedSlotStart)),
                and(gte(slot.slot_start, adjustedSlotStart), lte(slot.slot_end, adjustedSlotEnd))
              )
            )
          )
          .limit(1);

        if (overlappingSlot) {
          const isOwnSlot = prevSlotId !== null && overlappingSlot.id === prevSlotId;
          const isSameBand = requestToUpdate.band_id !== null && overlappingSlot.band_id === requestToUpdate.band_id;
          if (!isOwnSlot && !isSameBand) {
            let bandName = "another profile";
            if (overlappingSlot.band_id) {
              const [bandRecord] = await tx.select().from(band).where(eq(band.id, overlappingSlot.band_id)).limit(1);
              bandName = bandRecord ? bandRecord.name : "another profile";
            }
            console.log(
              "Conflict: slot id",
              overlappingSlot.id,
              "band_id",
              overlappingSlot.band_id,
              "room_id",
              overlappingSlot.room_id,
              "times",
              overlappingSlot.slot_start,
              "-",
              overlappingSlot.slot_end,
              "request room_id",
              requestToUpdate.room_id
            );
            throw new Error("CONFLICT:Time slot conflict");
          }
        }

        await tx.update(requestsTable).set(updateData).where(eq(requestsTable.id, id));

        if (prevStatus !== "approved") {
          const [userRecord] = await tx.select().from(user).where(eq(user.id, requestToUpdate.user_id)).limit(1);
          const userBandId = userRecord ? await getFirstBandId(userRecord.id) : null;
          const bandIdToInsert = updateData.band_id || requestToUpdate.band_id || userBandId;

          const [newSlot] = await tx
            .insert(slot)
            .values({
              slot_start: adjustedSlotStart,
              slot_end: adjustedSlotEnd,
              status: "booked",
              band_id: bandIdToInsert,
              room_id: requestToUpdate.room_id,
            })
            .returning();

          await tx.update(requestsTable).set({ slot_id: newSlot.id, response_date: new Date() }).where(eq(requestsTable.id, id));
        } else if (prevSlotId !== null) {
          await tx
            .update(slot)
            .set({ slot_start: adjustedSlotStart, slot_end: adjustedSlotEnd })
            .where(eq(slot.id, prevSlotId));
        }
      });
    } else {
      if (updateData.user_id === undefined || updateData.user_id === "") {
        delete updateData.user_id;
      }
      if (prevStatus === "approved" && prevSlotId !== null) {
        await db.transaction(async (tx) => {
          await tx.update(requestsTable).set({ ...updateData, slot_id: null }).where(eq(requestsTable.id, id));
          await tx.delete(slot).where(eq(slot.id, prevSlotId));
        });
      } else {
        await db.update(requestsTable).set(updateData).where(eq(requestsTable.id, id));
      }
    }

    const [updatedRequest] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    return NextResponse.json(
      { message: "Request updated successfully", request: updatedRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating request" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const [requestToDelete] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!requestToDelete) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    if (requestToDelete.slot_id !== null) {
      // Nullify the FK reference first, then delete the slot
      await db.update(requestsTable).set({ slot_id: null }).where(eq(requestsTable.id, id));
      await db.delete(slot).where(eq(slot.id, requestToDelete.slot_id));
    }

    await db.delete(requestsTable).where(eq(requestsTable.id, id));
    return NextResponse.json({ message: "Request deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting request" }, { status: 500 });
  }
}

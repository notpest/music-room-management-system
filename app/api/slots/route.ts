import { NextResponse } from "next/server";
import { db } from "@/db";
import { slot, band, room } from "@/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const roomNumber = searchParams.get("roomNumber");

    const filters = [];
    if (start && end) {
      filters.push(gte(slot.slot_start, new Date(start)), lte(slot.slot_start, new Date(end)));
    }
    if (roomNumber) {
      filters.push(eq(room.number, parseInt(roomNumber)));
    }

    const slots = await db
      .select({
        id: slot.id,
        status: slot.status,
        band_id: slot.band_id,
        room_id: slot.room_id,
        slot_start: slot.slot_start,
        slot_end: slot.slot_end,
        band_name: band.name,
        room_number: room.number,
        room_name: room.name,
      })
      .from(slot)
      .leftJoin(band, eq(slot.band_id, band.id))
      .leftJoin(room, eq(slot.room_id, room.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(asc(slot.slot_start));

    const formattedSlots = slots.map((s) => ({
      ...s,
      slot_start: new Date(s.slot_start).toISOString(),
      slot_end: new Date(s.slot_end).toISOString(),
    }));

    return NextResponse.json(formattedSlots, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching slots" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { slot_start, slot_end, band_id, room_id } = await request.json();

    const slotStartUTC = new Date(slot_start);
    const slotEndUTC = slot_end ? new Date(slot_end) : new Date(slotStartUTC.getTime());

    const [existingSlot] = await db
      .select()
      .from(slot)
      .where(and(eq(slot.slot_start, slotStartUTC), eq(slot.room_id, room_id)))
      .limit(1);

    if (existingSlot) {
      if (existingSlot.status === "booked") {
        return NextResponse.json({ message: "Slot is already booked" }, { status: 400 });
      }
      await db
        .update(slot)
        .set({ status: "booked", band_id, slot_end: slotEndUTC })
        .where(eq(slot.id, existingSlot.id));
    } else {
      await db.insert(slot).values({
        slot_start: slotStartUTC,
        slot_end: slotEndUTC,
        status: "booked",
        band_id,
        room_id,
      });
    }

    return NextResponse.json({ message: "Slot booked successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error booking slot" }, { status: 500 });
  }
}

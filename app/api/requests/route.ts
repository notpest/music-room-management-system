import { NextResponse } from "next/server";
import RequestModel from "@/models/Request";
import Slot from "@/models/Slot";
import User from "@/models/User";
import Band from "@/models/Band";
import UserBand from "@/models/UserBand";
import { Op } from "sequelize";

// Helper function to get first band ID for a user
async function getFirstBandId(userId: string): Promise<string | null> {
  const userBand = await UserBand.findOne({
    where: { user_id: userId },
    attributes: ["band_id"],
    order: [["band_id", "ASC"]]
  });
  return userBand ? userBand.band_id : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get("room_id");
    const user_id = searchParams.get("user_id");

    let where: any = {};
    if (room_id) {
      where.room_id = room_id;
    }
    if (user_id) {
      where.user_id = user_id;
    }
    const requests = await RequestModel.findAll({
      where,
      include: [
        { model: User, attributes: ["name"] },
        { model: Band, attributes: ["name"] },
      ],
      order: [["request_date", "DESC"]],
    });

    const formattedRequests = requests.map((reqItem: any) => {
      const data = reqItem.toJSON();
      return {
        ...data,
        user_name: data.User?.name || null,
        band_name: data.Band?.name || null,
      };
    });

    return NextResponse.json(formattedRequests, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user_id, slot_start, slot_end, room_id, band_id, reason } = await request.json();
    const userRecord = await User.findOne({ where: { id: user_id } });

    const userBandId = userRecord ? await getFirstBandId(userRecord.id) : null;
    const bandIdToUse = band_id || userBandId;
    
    const existingPendingRequest = await RequestModel.findOne({
      where: {
        band_id: bandIdToUse,
        room_id: room_id,
        status: "pending",
        [Op.or]: [
          { 
            slot_start: { 
              [Op.lt]: slot_end 
            },
            slot_end: { 
              [Op.gt]: slot_start 
            }
          },
          {
            slot_start: { 
              [Op.gte]: slot_start 
            },
            slot_end: { 
              [Op.lte]: slot_end 
            }
          }
        ]
      }
    });

    if (existingPendingRequest) {
      const band = await Band.findByPk(bandIdToUse);
      const bandName = band ? band.name : "this profile";
      return NextResponse.json(
        { message: `There's already a pending request for ${bandName} in this time slot` },
        { status: 409 }
      );
    }
    
    const newRequest = await RequestModel.create({
      user_id,
      status: "pending",
      slot_start,
      slot_end,
      room_id,
      band_id: bandIdToUse,
      reason
    });
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating request" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }
    const requestToUpdate = await RequestModel.findByPk(id);
    if (!requestToUpdate) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }
    const prevStatus = requestToUpdate.status;
    const prevSlotId = requestToUpdate.slot_id;
    
    const body = await request.json();
    const updateData: { [key: string]: any } = { ...body };

    if (updateData.status === "approved" || prevStatus === "approved") {
      const adjustedSlotStart = updateData.slot_start || requestToUpdate.slot_start;
      const adjustedSlotEnd = updateData.slot_end || requestToUpdate.slot_end;
      
      // Check for overlapping slots in the same room
      const overlappingSlot = await Slot.findOne({
        where: {
          room_id: requestToUpdate.room_id,
          [Op.or]: [
            // Overlapping start time
            { slot_start: { [Op.lt]: adjustedSlotEnd }, slot_end: { [Op.gt]: adjustedSlotStart } },
            // Inside existing slot
            { slot_start: { [Op.gte]: adjustedSlotStart }, slot_end: { [Op.lte]: adjustedSlotEnd } }
          ]
        }
      });

      // Conflict check logic
      if (overlappingSlot) {
        // Allow updating the same slot if it's the current request's slot
        if (!prevSlotId || overlappingSlot.id !== prevSlotId) {
          const band = await Band.findByPk(overlappingSlot.band_id);
          return NextResponse.json(
            { 
              message: "Time slot conflict",
              band_name: band ? band.name : "another profile"
            },
            { status: 409 }
          );
        }
      }
    }

    if (updateData.user_id === undefined || updateData.user_id === "") {
      delete updateData.user_id;
    }
    console.log("Updating request", id, updateData);
    await requestToUpdate.update(updateData, { returning: true });

    if (updateData.status === "approved" && prevStatus !== "approved") {
      const adjustedSlotStart = requestToUpdate.slot_start;
      const adjustedSlotEnd = requestToUpdate.slot_end;

      console.log("Creating slot with start:", adjustedSlotStart, "and end:", adjustedSlotEnd);
      const userRecord = await User.findOne({ where: { id: requestToUpdate.user_id } });
      const userBandId = userRecord ? await getFirstBandId(userRecord.id) : null;
      const bandIdToInsert = updateData.band_id || requestToUpdate.band_id || userBandId;

      const newSlot = await Slot.create({
        slot_start: adjustedSlotStart,
        slot_end: adjustedSlotEnd,
        status: "booked",
        band_id: bandIdToInsert,
        room_id: requestToUpdate.room_id,
      });
      await requestToUpdate.update({ slot_id: newSlot.id, response_date: new Date() });
    } else if (updateData.status === "approved" && prevStatus === "approved" && prevSlotId) {
      const adjustedSlotStart = requestToUpdate.slot_start;
      const adjustedSlotEnd = requestToUpdate.slot_end;

      await Slot.update(
        { slot_start: adjustedSlotStart, slot_end: adjustedSlotEnd },
        { where: { id: prevSlotId } }
      );
    } else if (prevStatus === "approved" && updateData.status !== "approved" && prevSlotId) {
      await Slot.destroy({ where: { id: prevSlotId } });
      await requestToUpdate.update({ slot_id: null });
    }

    if (updateData.reason !== undefined) {
      requestToUpdate.reason = updateData.reason;
    }

    return NextResponse.json(
      { message: "Request updated successfully", request: requestToUpdate },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating request" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }
    const requestToDelete = await RequestModel.findByPk(id);
    if (!requestToDelete) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }
    if (requestToDelete.status === "approved" && requestToDelete.slot_id) {
      await Slot.destroy({ where: { id: requestToDelete.slot_id } });
    }
    await requestToDelete.destroy();
    return NextResponse.json({ message: "Request deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting request" }, { status: 500 });
  }
}

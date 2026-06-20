import { NextResponse } from "next/server";
import Slot from "@/models/Slot";
import Band from "@/models/Band";
import Room from "@/models/Room";
import { Op } from "sequelize";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const roomNumber = searchParams.get("roomNumber");

    let where: any = {};
    if (start && end) {
      where.slot_start = {
        [Op.gte]: new Date(start),
        [Op.lte]: new Date(end),
      };
    }
    // If roomNumber is provided, filter by the associated Room's number.
    if (roomNumber) {
      where["$Room.number$"] = roomNumber;
    }

    const slots = await Slot.findAll({
      where,
      include: [
        { model: Band, attributes: ["name"] },
        { model: Room, attributes: ["number", "name"] }
      ],
      raw: true,
      order: [["slot_start", "ASC"]],
    });

    const formattedSlots = slots.map((slot) => ({
      ...slot,
      slot_start: new Date(slot.slot_start).toISOString(),
      slot_end: new Date(slot.slot_end).toISOString(),
      band_name: (slot as any)["Band.name"],
      room_number: (slot as any)["Room.number"], // optionally include room number
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

    // Use room_id in the lookup
    const existingSlot = await Slot.findOne({ where: { slot_start: slotStartUTC, room_id } });
    if (existingSlot) {
      if (existingSlot.status === "booked") {
        return NextResponse.json({ message: "Slot is already booked" }, { status: 400 });
      }
      await existingSlot.update({ status: "booked", band_id, slot_end: slotEndUTC });
    } else {
      await Slot.create({
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

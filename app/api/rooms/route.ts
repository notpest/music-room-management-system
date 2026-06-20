import { NextResponse } from "next/server";
import Room from "@/models/Room";

export async function GET() {
  try {
    const rooms = await Room.findAll({ order: [["number", "ASC"]] });
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching rooms" }, { status: 500 });
  }
}

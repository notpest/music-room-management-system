import { NextResponse } from "next/server";
import Equipment from "@/models/Equipment";

export async function POST(request: Request) {
  try {
    const { equipment_name, category, quantity } = await request.json();
    if (!equipment_name || !category || quantity === undefined) {
      return NextResponse.json(
        { message: "Equipment name, category, and quantity are required." },
        { status: 400 }
      );
    }
    const newEquipment = await Equipment.create({ equipment_name, category, quantity });
    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating equipment" }, { status: 500 });
  }
}

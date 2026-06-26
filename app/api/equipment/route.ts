import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipment } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { equipment_name, category, quantity } = await request.json();
    if (!equipment_name || !category || quantity === undefined) {
      return NextResponse.json(
        { message: "Equipment name, category, and quantity are required." },
        { status: 400 }
      );
    }
    const [newEquipment] = await db.insert(equipment).values({ equipment_name, category, quantity }).returning();
    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating equipment" }, { status: 500 });
  }
}

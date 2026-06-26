import { NextResponse } from "next/server";
import { db } from "@/db";
import { room } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rooms = await db.select().from(room).orderBy(asc(room.number));
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching rooms" }, { status: 500 });
  }
}

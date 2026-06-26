import { NextResponse } from "next/server";
import { db } from "@/db";
import { band } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const allBands = await db.select().from(band).orderBy(asc(band.name));
    return NextResponse.json(allBands, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching bands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, colour } = await request.json();
    if (!name || !colour) {
      return NextResponse.json({ message: "Name and colour are required" }, { status: 400 });
    }
    const [newBand] = await db.insert(band).values({ name, colour }).returning();
    return NextResponse.json(newBand, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating band" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { name, colour } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "Band ID is required" }, { status: 400 });
    }
    if (!name || !colour) {
      return NextResponse.json({ message: "Name and colour are required" }, { status: 400 });
    }

    const [existing] = await db.select().from(band).where(eq(band.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ message: "Band not found" }, { status: 404 });
    }

    const [updated] = await db.update(band).set({ name, colour }).where(eq(band.id, id)).returning();
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating band" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Band ID is required" }, { status: 400 });
    }

    const [existing] = await db.select().from(band).where(eq(band.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ message: "Band not found" }, { status: 404 });
    }

    await db.delete(band).where(eq(band.id, id));
    return NextResponse.json({ message: "Band deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting band" }, { status: 500 });
  }
}

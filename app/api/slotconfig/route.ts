import { NextResponse } from "next/server";
import { db } from "@/db";
import { slotConfig } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const configs = await db.select().from(slotConfig).orderBy(asc(slotConfig.start_time));
    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching slot configurations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { start_time, end_time, enabled } = await request.json();

    if (!start_time || !end_time) {
      return NextResponse.json({ message: "Start time and end time are required." }, { status: 400 });
    }

    const [newConfig] = await db.insert(slotConfig).values({ start_time, end_time, enabled }).returning();
    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error("Error creating slot configuration:", error);
    return NextResponse.json({ message: "Error creating slot configuration" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, start_time, end_time, enabled } = await request.json();
    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const [existing] = await db.select().from(slotConfig).where(eq(slotConfig.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ message: "Slot configuration not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(slotConfig)
      .set({ start_time, end_time, enabled })
      .where(eq(slotConfig.id, id))
      .returning();
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating slot configuration" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (e) {
        // ignore body parsing error
      }
    }

    if (!id) {
      return NextResponse.json({ message: "Slot configuration ID is required" }, { status: 400 });
    }

    const [existing] = await db.select().from(slotConfig).where(eq(slotConfig.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ message: "Slot configuration not found" }, { status: 404 });
    }

    await db.delete(slotConfig).where(eq(slotConfig.id, id));
    return NextResponse.json({ message: "Slot configuration deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting slot configuration" }, { status: 500 });
  }
}

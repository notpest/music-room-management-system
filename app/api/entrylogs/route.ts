import { NextResponse } from "next/server";
import { db } from "@/db";
import { entryLog, equipment } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const logs = await db
      .select({
        id: entryLog.id,
        equipment_id: entryLog.equipment_id,
        scanned_at: entryLog.scanned_at,
        equipment_name: equipment.equipment_name,
        category: equipment.category,
      })
      .from(entryLog)
      .leftJoin(equipment, eq(entryLog.equipment_id, equipment.id))
      .orderBy(desc(entryLog.scanned_at));

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching entry logs" }, { status: 500 });
  }
}

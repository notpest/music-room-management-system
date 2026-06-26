import { NextResponse } from "next/server";
import { db } from "@/db";
import { user, band, userBand } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bandId: band.id,
        bandName: band.name,
      })
      .from(user)
      .leftJoin(userBand, eq(user.id, userBand.user_id))
      .leftJoin(band, eq(userBand.band_id, band.id));

    const grouped: Record<string, any> = {};
    for (const row of rows) {
      if (!grouped[row.id]) {
        grouped[row.id] = { id: row.id, name: row.name, email: row.email, role: row.role, bands: [] };
      }
      if (row.bandId && row.bandName) {
        grouped[row.id].bands.push({ id: row.bandId, name: row.bandName });
      }
    }

    return NextResponse.json(Object.values(grouped), { status: 200 });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing user id" }, { status: 400 });
    }

    await db.delete(userBand).where(eq(userBand.user_id, id));

    const [existing] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await db.delete(user).where(eq(user.id, id));
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing user id" }, { status: 400 });
    }

    const { name, email, role, bandIds } = await request.json();
    const [existing] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (Object.keys(updateData).length > 0) {
      await db.update(user).set(updateData).where(eq(user.id, id));
    }

    if (Array.isArray(bandIds)) {
      await db.delete(userBand).where(eq(userBand.user_id, id));
      if (bandIds.length > 0) {
        const newPairs = bandIds.map((bId: string) => ({ user_id: id, band_id: bId }));
        await db.insert(userBand).values(newPairs);
      }
    }

    return NextResponse.json({ message: "User updated" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}

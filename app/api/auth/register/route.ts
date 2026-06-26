// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { user, userBand, band } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { name, password, bandIds, email, role } = await request.json();

    // Validate required fields
    if (!name || !password || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the plaintext password
    const saltRounds = 10;
    const hashed_password = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [newUser] = await db
      .insert(user)
      .values({
        name,
        hashed_password,
        email,
        role: role || "user",
      })
      .returning();

    if (Array.isArray(bandIds) && bandIds.length > 0) {
      const pairs = bandIds.map((bId: string) => ({
        user_id: newUser.id,
        band_id: bId,
      }));
      await db.insert(userBand).values(pairs);
    }

    // Fetch created user with bands
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
      .leftJoin(band, eq(userBand.band_id, band.id))
      .where(eq(user.id, newUser.id));

    const createdUserWithBands = {
      id: rows[0]?.id,
      name: rows[0]?.name,
      email: rows[0]?.email,
      role: rows[0]?.role,
      Bands: rows
        .filter((r) => r.bandId)
        .map((r) => ({ id: r.bandId, name: r.bandName })),
    };

    return NextResponse.json(
      { message: "User registered successfully", user: createdUserWithBands },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

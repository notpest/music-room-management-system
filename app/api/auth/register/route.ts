// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { name, username, password, bandId, email, role } = await request.json();

    // Validate required fields
    if (!name || !username || !password || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists by username (or email if you prefer)
    const existingUser = await User.findOne({ where: { username } });
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
    const newUser = await User.create({
      name,
      username,
      hashed_password,
      band_id: bandId || null,
      email,
      role,
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
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

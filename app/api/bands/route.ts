import { NextResponse } from "next/server";
import Band from "@/models/Band";

export async function GET() {
  try {
    const allBands = await Band.findAll({ order: [["name", "ASC"]] });
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
    const newBand = await Band.create({ name, colour });
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

    const band = await Band.findByPk(id);
    if (!band) {
      return NextResponse.json({ message: "Band not found" }, { status: 404 });
    }

    band.name = name;
    band.colour = colour;
    await band.save();

    return NextResponse.json(band, { status: 200 });
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

    const band = await Band.findByPk(id);
    if (!band) {
      return NextResponse.json({ message: "Band not found" }, { status: 404 });
    }

    await band.destroy();
    return NextResponse.json({ message: "Band deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting band" }, { status: 500 });
  }
}

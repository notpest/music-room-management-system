import { NextResponse } from "next/server";
import SlotConfig from "@/models/SlotConfig";

export async function GET() {
  try {
    const configs = await SlotConfig.findAll({ order: [["start_time", "ASC"]] });
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

    const newConfig = await SlotConfig.create({ start_time, end_time, enabled });
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

    const config = await SlotConfig.findByPk(id);
    if (!config) {
      return NextResponse.json({ message: "Slot configuration not found" }, { status: 404 });
    }

    await config.update({ start_time, end_time, enabled });
    return NextResponse.json(config, { status: 200 });
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

    const config = await SlotConfig.findByPk(id);
    if (!config) {
      return NextResponse.json({ message: "Slot configuration not found" }, { status: 404 });
    }

    await config.destroy();
    return NextResponse.json({ message: "Slot configuration deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting slot configuration" }, { status: 500 });
  }
}

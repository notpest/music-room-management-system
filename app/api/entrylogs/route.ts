import { NextResponse } from "next/server";
import EntryLog from "@/models/EntryLog";
import Equipment from "@/models/Equipment";
import { exec } from "child_process";

export async function GET() {
  try {
    const logs = await EntryLog.findAll({
      include: [
        {
          model: Equipment,
          attributes: ["equipment_name", "category"],
        },
      ],
      order: [["scanned_at", "DESC"]],
    });
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching entry logs" }, { status: 500 });
  }
}

export async function POST() {
  return new Promise<NextResponse>((resolve) => {
    exec("python parse_gmail.py", (error: any, stdout: string, stderr: string) => {
      if (error) {
        console.error("Error executing python script:", error);
        resolve(NextResponse.json({ message: "Error scanning Gmail" }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ message: stdout.trim() }, { status: 200 }));
    });
  });
}

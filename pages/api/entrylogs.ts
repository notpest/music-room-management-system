// pages/api/entrylogs.ts
import { NextApiRequest, NextApiResponse } from "next";
import EntryLog from "../../models/EntryLog";
import Equipment from "../../models/Equipment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight OPTIONS requests.
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,POST,OPTIONS");
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
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
      res.status(200).json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching entry logs" });
    }
  } else if (req.method === "POST") {
    // The POST handler calls the Python script (see below).
    const { exec } = require("child_process");
    exec("python parse_gmail.py", (error: any, stdout: string, stderr: string) => {
      if (error) {
        console.error("Error executing python script:", error);
        res.status(500).json({ message: "Error scanning Gmail" });
        return;
      }
      res.status(200).json({ message: stdout.trim() });
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

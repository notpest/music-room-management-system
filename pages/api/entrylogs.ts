// pages/api/entrylogs.ts
import { NextApiRequest, NextApiResponse } from 'next';
import EntryLog from '../../models/EntryLog';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight OPTIONS
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,POST,DELETE,OPTIONS");
    res.status(200).end();
    return;
  }

  switch(req.method) {
    case 'GET':
      try {
        const logs = await EntryLog.findAll({
          order: [['scanned_at', 'DESC']],
        });
        res.status(200).json(logs);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching entry logs" });
      }
      break;
    case 'POST':
      try {
        const { equipment_id, scanned_at } = req.body;
        const newLog = await EntryLog.create({
          equipment_id,
          scanned_at,
        });
        res.status(201).json(newLog);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating entry log" });
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        const logId = Array.isArray(id) ? id[0] : id;
        await EntryLog.destroy({ where: { id: logId } });
        res.status(200).json({ message: "Entry log deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting entry log" });
      }
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

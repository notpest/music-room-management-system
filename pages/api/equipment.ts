// pages/api/equipment.ts
import { NextApiRequest, NextApiResponse } from "next";
import Equipment from "../../models/Equipment";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      try {
        const { equipment_name, category, quantity } = req.body;
        if (!equipment_name || !category || quantity === undefined) {
          return res
            .status(400)
            .json({ message: "Equipment name, category, and quantity are required." });
        }
        const newEquipment = await Equipment.create({ equipment_name, category, quantity });
        res.status(201).json(newEquipment);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating equipment" });
      }
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;

// pages/api/requests.ts
import { NextApiRequest, NextApiResponse } from "next";
import Request from "../../models/Request";
import Slot from "../../models/Slot";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,POST,PUT,DELETE,OPTIONS");
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const requestId = Array.isArray(id) ? id[0] : id;

  switch (req.method) {
    case "GET":
      try {
        const requests = await Request.findAll({
          order: [["request_date", "ASC"]],
        });
        res.status(200).json(requests);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching requests" });
      }
      break;

    case "POST":
      try {
        const { user_id, slot_start, slot_end } = req.body;
        // Insert a new request with status "pending"
        const newRequest = await Request.create({
          user_id,
          status: "pending",
          slot_start,
          slot_end,
        });
        res.status(201).json(newRequest);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating request" });
      }
      break;

    case "PUT":
      try {
        if (!requestId) {
          res.status(400).json({ message: "ID is required" });
          return;
        }
        const requestToUpdate = await Request.findByPk(requestId);
        if (!requestToUpdate) {
          res.status(404).json({ message: "Request not found" });
          return;
        }
        const updateData: { [key: string]: any } = { ...req.body };
        if (updateData.user_id === undefined || updateData.user_id === "") {
          delete updateData.user_id;
        }
        console.log("Updating request", requestId, updateData);
        await requestToUpdate.update(updateData, { returning: true });

        if (updateData.status === "approved") {
            // Calculate offset for 5.5 hours in milliseconds.
            const offsetMs = 5.5 * 60 * 60 * 1000;
            // Ensure slot_start and slot_end are treated as Date objects.
            const origStart = (requestToUpdate.slot_start instanceof Date)
              ? requestToUpdate.slot_start.getTime()
              : new Date(requestToUpdate.slot_start).getTime();
            const origEnd = (requestToUpdate.slot_end instanceof Date)
              ? requestToUpdate.slot_end.getTime()
              : new Date(requestToUpdate.slot_end).getTime();
            // Add the offset.
            const adjustedSlotStart = new Date(origStart + offsetMs).toISOString();
            const adjustedSlotEnd = new Date(origEnd + offsetMs).toISOString();
          
            console.log("Creating slot with start:", adjustedSlotStart, "and end:", adjustedSlotEnd);
          
            // Create the slot record using the adjusted times.
            await Slot.create({
              slot_start: adjustedSlotStart,
              slot_end: adjustedSlotEnd,
              status: "booked",
              band_id: requestToUpdate.user_id,
            });
          
            // Optionally update the response_date.
            await requestToUpdate.update({ response_date: new Date() });
          }
          
        res.status(200).json({
          message: "Request updated successfully",
          request: requestToUpdate,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating request" });
      }
      break;

    case "DELETE":
      try {
        if (!requestId) {
          res.status(400).json({ message: "ID is required" });
          return;
        }
        const requestToDelete = await Request.findByPk(requestId);
        if (!requestToDelete) {
          res.status(404).json({ message: "Request not found" });
          return;
        }
        await requestToDelete.destroy();
        res.status(200).json({ message: "Request deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting request" });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}

// pages/api/requests.ts
import { NextApiRequest, NextApiResponse } from "next";
import Request from "../../models/Request";
import Slot from "../../models/Slot";
import User from "../../models/User";
import Band from "../../models/Band";

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
        // Enhance each request with user_name and band_name.
        const enhancedRequests = await Promise.all(
          requests.map(async (reqItem) => {
            // Use toJSON() to get plain object data.
            const requestData = reqItem.toJSON() as any;
            // Fetch the user by user_id.
            const user = await User.findOne({ where: { id: requestData.user_id } });
            let user_name = null;
            let band_name = null;
            if (user) {
              user_name = user.name;
              // user.band_id connects the user to the band.
              if (user.band_id) {
                const band = await Band.findOne({ where: { id: user.band_id } });
                if (band) {
                  band_name = band.name;
                }
              }
            }
            return {
              ...requestData,
              user_name,
              band_name,
            };
          })
        );
        res.status(200).json(enhancedRequests);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching requests" });
      }
      break;

    // ... (the POST, PUT, DELETE cases remain unchanged)
    case "POST":
      try {
        const { user_id, slot_start, slot_end } = req.body;
        // Create a new request with status "pending"
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

        // Save previous status and slot_id
        const prevStatus = requestToUpdate.status;
        const prevSlotId = requestToUpdate.slot_id;

        const updateData: { [key: string]: any } = { ...req.body };
        if (updateData.user_id === undefined || updateData.user_id === "") {
          delete updateData.user_id;
        }
        console.log("Updating request", requestId, updateData);
        await requestToUpdate.update(updateData, { returning: true });

        // When new status is "approved" and previously was not approved,
        // create a new slot record and update the request's slot_id.
        if (updateData.status === "approved" && prevStatus !== "approved") {
          // Add 5.5 hours offset
          const offsetMs = 5.5 * 60 * 60 * 1000;
          const origStart = requestToUpdate.slot_start instanceof Date
            ? requestToUpdate.slot_start.getTime()
            : new Date(requestToUpdate.slot_start).getTime();
          const origEnd = requestToUpdate.slot_end instanceof Date
            ? requestToUpdate.slot_end.getTime()
            : new Date(requestToUpdate.slot_end).getTime();
          const adjustedSlotStart = new Date(origStart + offsetMs).toISOString();
          const adjustedSlotEnd = new Date(origEnd + offsetMs).toISOString();

          console.log("Creating slot with start:", adjustedSlotStart, "and end:", adjustedSlotEnd);
          
          // Fetch the user record to get the stored band_id
          const userRecord = await User.findOne({ where: { id: requestToUpdate.user_id } });
          const bandIdToInsert = userRecord?.band_id;

          const newSlot = await Slot.create({
            slot_start: adjustedSlotStart,
            slot_end: adjustedSlotEnd,
            status: "booked",
            band_id: bandIdToInsert,
          });
          // Update the request's slot_id with the new slot's id.
          await requestToUpdate.update({ slot_id: newSlot.id, response_date: new Date() });
        }
        // If the request is already approved and you're editing the slot times, update the slot record.
        else if (updateData.status === "approved" && prevStatus === "approved" && prevSlotId) {
          const offsetMs = 5.5 * 60 * 60 * 1000;
          const origStart = new Date(requestToUpdate.slot_start).getTime();
          const origEnd = new Date(requestToUpdate.slot_end).getTime();
          const adjustedSlotStart = new Date(origStart + offsetMs).toISOString();
          const adjustedSlotEnd = new Date(origEnd + offsetMs).toISOString();

          await Slot.update(
            { slot_start: adjustedSlotStart, slot_end: adjustedSlotEnd },
            { where: { id: prevSlotId } }
          );
        }
        // If the request was previously approved but now changed to pending/denied,
        // delete the corresponding slot using the stored slot_id.
        else if (prevStatus === "approved" && updateData.status !== "approved" && prevSlotId) {
          await Slot.destroy({
            where: {
              id: prevSlotId,
            },
          });
          await requestToUpdate.update({ slot_id: null });
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
        // If the request is approved, delete the corresponding slot using its id.
        if (requestToDelete.status === "approved" && requestToDelete.slot_id) {
          await Slot.destroy({
            where: {
              id: requestToDelete.slot_id,
            },
          });
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

// pages/api/requests.ts
import { NextApiRequest, NextApiResponse } from "next";
import Request from "../../models/Request";
import Slot from "../../models/Slot";
import User from "../../models/User";
import Band from "../../models/Band";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        let where: any = {};
        if (req.query.room_id) {
          where.room_id = req.query.room_id;
        }
        const requests = await Request.findAll({
          where,
          order: [["request_date", "ASC"]],
        });
        const enhancedRequests = await Promise.all(
          requests.map(async (reqItem) => {
            const requestData = reqItem.toJSON() as any;
            const user = await User.findOne({ where: { id: requestData.user_id } });
            let user_name = null;
            let band_name = null;
            if (user) {
              user_name = user.name;
              if (user.band_id) {
                const band = await Band.findOne({ where: { id: user.band_id } });
                if (band) {
                  band_name = band.name;
                }
              }
            }
            return { ...requestData, user_name, band_name };
          })
        );
        res.status(200).json(enhancedRequests);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching requests" });
      }
      break;

    case "POST":
      try {
        const { user_id, slot_start, slot_end, room_id } = req.body;
        const newRequest = await Request.create({
          user_id,
          status: "pending",
          slot_start,
          slot_end,
          room_id,  // include room_id from the request body
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
        const prevStatus = requestToUpdate.status;
        const prevSlotId = requestToUpdate.slot_id;
        const updateData: { [key: string]: any } = { ...req.body };
        if (updateData.user_id === undefined || updateData.user_id === "") {
          delete updateData.user_id;
        }
        console.log("Updating request", requestId, updateData);
        await requestToUpdate.update(updateData, { returning: true });

        if (updateData.status === "approved" && prevStatus !== "approved") {
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
          const userRecord = await User.findOne({ where: { id: requestToUpdate.user_id } });
          const bandIdToInsert = userRecord?.band_id;
          const newSlot = await Slot.create({
            slot_start: adjustedSlotStart,
            slot_end: adjustedSlotEnd,
            status: "booked",
            band_id: bandIdToInsert,
            room_id: requestToUpdate.room_id,  // include room_id here as well
          });
          await requestToUpdate.update({ slot_id: newSlot.id, response_date: new Date() });
        } else if (updateData.status === "approved" && prevStatus === "approved" && prevSlotId) {
          const offsetMs = 5.5 * 60 * 60 * 1000;
          const origStart = new Date(requestToUpdate.slot_start).getTime();
          const origEnd = new Date(requestToUpdate.slot_end).getTime();
          const adjustedSlotStart = new Date(origStart + offsetMs).toISOString();
          const adjustedSlotEnd = new Date(origEnd + offsetMs).toISOString();

          await Slot.update(
            { slot_start: adjustedSlotStart, slot_end: adjustedSlotEnd },
            { where: { id: prevSlotId } }
          );
        } else if (prevStatus === "approved" && updateData.status !== "approved" && prevSlotId) {
          await Slot.destroy({ where: { id: prevSlotId } });
          await requestToUpdate.update({ slot_id: null });
        }

        res.status(200).json({ message: "Request updated successfully", request: requestToUpdate });
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
        if (requestToDelete.status === "approved" && requestToDelete.slot_id) {
          await Slot.destroy({ where: { id: requestToDelete.slot_id } });
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

// pages/api/requests.ts
import { NextApiRequest, NextApiResponse } from "next";
import Request from "../../models/Request";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  // Use the UUID string directly.
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
        // Build update object.
        const updateData: { [key: string]: any } = { ...req.body };
        if (updateData.user_id === undefined || updateData.user_id === "") {
          delete updateData.user_id;
        }
        console.log("Updating request", requestId, updateData);
        await requestToUpdate.update(updateData, { returning: true });
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

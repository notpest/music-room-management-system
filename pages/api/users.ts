// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../models/User";
import Band from "../../models/Band";
import UserBand from "../../models/UserBand";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract optional `id` from query (for DELETE or PUT)
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  switch (req.method) {
    case "GET":
      try {
        // Fetch all users, including their bands
        const allUsers = await User.findAll({
          include: [
            {
              model: Band,
              as: "Bands",
              through: { attributes: [] }, // do not return join‐table columns
            },
          ],
        });

        const result = allUsers.map((u) => {
          const ujson: any = u.toJSON();
          return {
            id: ujson.id,
            name: ujson.name,
            username: ujson.username,
            email: ujson.email,
            role: ujson.role,
            // Extract an array of { id, name } from Bands
            bands: (ujson.Bands || []).map((b: any) => ({ id: b.id, name: b.name })),
          };
        });

        res.status(200).json(result);
      } catch (error) {
        console.error("GET /api/users error:", error);
        res.status(500).json({ message: "Error fetching users" });
      }
      break;

    case "DELETE":
      if (!id) {
        res.status(400).json({ message: "Missing user id" });
        return;
      }
      try {
        // 1) Delete all join‐table entries for that user
        await UserBand.destroy({ where: { user_id: id } });
        // 2) Delete the user row itself
        const userToDelete = await User.findByPk(id);
        if (!userToDelete) {
          return res.status(404).json({ message: "User not found" });
        }
        await userToDelete.destroy();
        return res.status(200).json({ message: "User deleted" });
      } catch (error) {
        console.error("DELETE /api/users error:", error);
        return res.status(500).json({ message: "Error deleting user" });
      }
      break;

    case "PUT":
      if (!id) {
        res.status(400).json({ message: "Missing user id" });
        return;
      }
      
      try {
        // 1) Update basic fields on User (except password)
        const { name, username, email, role, bandIds } = req.body as any;
        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) {
          return res.status(404).json({ message: "User not found" });
        }

        // Allow updating only name, username, email, role
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        await userToUpdate.update(updateData);

        // 2) If bandIds is provided (array), then sync the join‐table:
        //    Delete any existing UserBand rows for this user, then bulkInsert the new pairs.
        if (Array.isArray(bandIds)) {
          // Remove old associations
          await UserBand.destroy({ where: { user_id: id } });
          // Insert new associations
          const newPairs = bandIds.map((bId: string) => ({
            user_id: id,
            band_id: bId,
          }));
          if (newPairs.length > 0) {
            await UserBand.bulkCreate(newPairs);
          }
        }

        return res.status(200).json({ message: "User updated" });
      } catch (error) {
        console.error("PUT /api/users error:", error);
        return res.status(500).json({ message: "Error updating user" });
      }

    default:
      res.setHeader("Allow", "GET,DELETE,PUT");
      return res.status(405).end();
  }
}

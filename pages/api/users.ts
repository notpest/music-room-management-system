// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../models/User";
import Band from "../../models/Band";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract optional `id` from query (for DELETE or PUT)
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  switch (req.method) {
    case "GET":
      try {
        // Fetch all users, then fetch each user's band name if band_id is set.
        const allUsers = await User.findAll();
        const result = await Promise.all(
          allUsers.map(async (u) => {
            const ujson = u.toJSON() as any;
            let band_name: string | null = null;
            if (ujson.band_id) {
              const b = await Band.findByPk(ujson.band_id);
              band_name = b ? b.name : null;
            }
            return {
              id: ujson.id,
              name: ujson.name,
              username: ujson.username,
              email: ujson.email,
              band_id: ujson.band_id,
              band_name,
              role: ujson.role,
            };
          })
        );
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
        const userToDelete = await User.findByPk(id);
        if (!userToDelete) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        await userToDelete.destroy();
        res.status(200).json({ message: "User deleted" });
      } catch (error) {
        console.error("DELETE /api/users error:", error);
        res.status(500).json({ message: "Error deleting user" });
      }
      break;

    case "PUT":
      if (!id) {
        res.status(400).json({ message: "Missing user id" });
        return;
      }
      try {
        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        // Only allow updating name, username, email or band_id
        const { name, username, email, band_id, role } = req.body as any;
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (band_id !== undefined) updateData.band_id = band_id;

        await userToUpdate.update(updateData);
        res.status(200).json({ message: "User updated" });
      } catch (error) {
        console.error("PUT /api/users error:", error);
        res.status(500).json({ message: "Error updating user" });
      }
      break;

    default:
      res.setHeader("Allow", "GET,DELETE,PUT");
      res.status(405).end();
  }
}

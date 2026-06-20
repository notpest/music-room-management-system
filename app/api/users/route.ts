import { NextResponse } from "next/server";
import User from "@/models/User";
import Band from "@/models/Band";
import UserBand from "@/models/UserBand";

export async function GET() {
  try {
    const allUsers = await User.findAll({
      include: [
        {
          model: Band,
          as: "Bands",
          through: { attributes: [] },
        },
      ],
    });

    const result = allUsers.map((u) => {
      const ujson: any = u.toJSON();
      return {
        id: ujson.id,
        name: ujson.name,
        email: ujson.email,
        role: ujson.role,
        bands: (ujson.Bands || []).map((b: any) => ({ id: b.id, name: b.name })),
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing user id" }, { status: 400 });
    }

    await UserBand.destroy({ where: { user_id: id } });
    const userToDelete = await User.findByPk(id);
    if (!userToDelete) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    await userToDelete.destroy();
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing user id" }, { status: 400 });
    }

    const { name, email, role, bandIds } = await request.json();
    const userToUpdate = await User.findByPk(id);
    if (!userToUpdate) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    await userToUpdate.update(updateData);

    if (Array.isArray(bandIds)) {
      await UserBand.destroy({ where: { user_id: id } });
      const newPairs = bandIds.map((bId: string) => ({
        user_id: id,
        band_id: bId,
      }));
      if (newPairs.length > 0) {
        await UserBand.bulkCreate(newPairs);
      }
    }

    return NextResponse.json({ message: "User updated" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}

// pages/api/rooms.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Room from '../../models/Room';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rooms = await Room.findAll({ order: [['number', 'ASC']] });
    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
}
// pages/api/slots.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Slot from '../../models/Slot';
import Band from '../../models/Band';
import Room from '../../models/Room';
import { Op } from 'sequelize';

const getSlots = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { start, end, roomNumber } = req.query;
    let where: any = {};
    if (start && end) {
      where.slot_start = {
        [Op.gte]: new Date(start as string),
        [Op.lte]: new Date(end as string),
      };
    }
    // If roomNumber is provided, filter by the associated Room's number.
    if (roomNumber) {
      where['$Room.number$'] = roomNumber;
    }
    
    const slots = await Slot.findAll({
      where,
      include: [
        { model: Band, attributes: ['name'] },
        { model: Room, attributes: ['number', 'name'] }
      ],
      raw: true,
      order: [['slot_start', 'ASC']],
    });

    const formattedSlots = slots.map((slot) => ({
      ...slot,
      slot_start: new Date(slot.slot_start).toISOString(),
      slot_end: new Date(slot.slot_end).toISOString(),
      band_name: (slot as any)['Band.name'],
      room_number: (slot as any)['Room.number'], // optionally include room number
    }));

    res.json(formattedSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching slots' });
  }
};

const bookSlot = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { slot_start, slot_end, band_id, room_id } = req.body;

    const slotStartUTC = new Date(slot_start);
    const slotEndUTC = slot_end ? new Date(slot_end) : new Date(slotStartUTC.getTime() + 90 * 60000);

    // Use room_id in the lookup
    const existingSlot = await Slot.findOne({ where: { slot_start: slotStartUTC, room_id } });
    if (existingSlot) {
      if (existingSlot.status === "booked") {
        res.status(400).json({ message: 'Slot is already booked' });
        return;
      }
      await existingSlot.update({ status: 'booked', band_id, slot_end: slotEndUTC });
    } else {
      await Slot.create({
        slot_start: slotStartUTC,
        slot_end: slotEndUTC,
        status: 'booked',
        band_id,
        room_id,
      });
    }

    res.json({ message: 'Slot booked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error booking slot' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await getSlots(req, res);
      break;
    case 'POST':
      await bookSlot(req, res);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}

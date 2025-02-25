import { NextApiRequest, NextApiResponse } from 'next';
import Slot from '../../models/Slot';
import Band from '../../models/Band';
import { Op } from 'sequelize';

const getSlots = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { start, end } = req.query;
    let where = {};
    if (start && end) {
      where = {
        slot_start: {
          [Op.gte]: new Date(start as string),
          [Op.lte]: new Date(end as string),
        },
      };
    }
    
    const slots = await Slot.findAll({
      where, // Apply filtering if provided
      include: [{ model: Band, attributes: ['name'] }],
      raw: true,
      order: [['slot_start', 'ASC']],
    });

    // Convert slot_start and slot_end to UTC before sending the response
    const formattedSlots = slots.map((slot) => ({
      ...slot,
      slot_start: new Date(slot.slot_start).toISOString(), // Ensure UTC format
      slot_end: new Date(slot.slot_end).toISOString(), // Ensure UTC format
      band_name: (slot as any)['Band.name'],
    }));

    res.json(formattedSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching slots' });
  }
};

const bookSlot = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { slot_start, slot_end, band_id } = req.body;

    // Convert slot_start to UTC
    const slotStartUTC = new Date(slot_start);

    // Use provided slot_end if available; otherwise default to 1.5 hours after slot_start
    const slotEndUTC = slot_end ? new Date(slot_end) : new Date(slotStartUTC.getTime() + 90 * 60000);

    // Check if the slot already exists (using slot_start as unique key)
    const existingSlot = await Slot.findOne({ where: { slot_start: slotStartUTC } });
    if (existingSlot) {
      if (existingSlot.status === "booked") {
        res.status(400).json({ message: 'Slot is already booked' });
        return;
      }
      // Update existing slot with new status, band_id and slot_end from the request
      await existingSlot.update({ status: 'booked', band_id, slot_end: slotEndUTC });
    } else {
      // Create a new slot using both provided slot_start and slot_end
      await Slot.create({
        slot_start: slotStartUTC,
        slot_end: slotEndUTC,
        status: 'booked',
        band_id,
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

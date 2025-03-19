// pages/api/bands.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Band from '../../models/Band';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      try {
        const { name, colour } = req.body;
        if (!name || !colour) {
          return res.status(400).json({ message: 'Name and colour are required' });
        }
        const newBand = await Band.create({ name, colour });
        res.status(201).json(newBand);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating band' });
      }
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;

// pages/api/bands.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Band from '../../models/Band';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("→ Hit /api/bands with method:", req.method);
  switch (req.method) {
    case 'GET':
      console.log("→ In GET branch of /api/bands");
      try {
        const allBands = await Band.findAll({ order: [['name', 'ASC']] });
        res.status(200).json(allBands);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching bands' });
      }
      break;

    case 'POST':
      console.log("→ In POST branch of /api/bands");
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

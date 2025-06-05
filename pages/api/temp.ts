// pages/api/bands.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Band from '../../models/Band';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("→ Hit /api/bands with method:", req.method);
  switch (req.method) {
    case 'GET':
      try {
        const allBands = await Band.findAll({ order: [['name', 'ASC']] });
        res.status(200).json(allBands);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching bands' });
      }
      break;

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

    // Add DELETE method handler
    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ message: 'Band ID is required' });
        }
        
        const band = await Band.findByPk(id as string);
        if (!band) {
          return res.status(404).json({ message: 'Band not found' });
        }
        
        await band.destroy();
        res.status(200).json({ message: 'Band deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting band' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
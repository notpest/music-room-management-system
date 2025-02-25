// pages/api/admin/slot-config.ts
import { NextApiRequest, NextApiResponse } from 'next';
import SlotConfig from '../../models/SlotConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // You should add authentication/authorization logic here to restrict access to admins.
  switch (req.method) {
    case 'GET':
      try {
        const configs = await SlotConfig.findAll({ order: [['start_time', 'ASC']] });
        res.status(200).json(configs);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching slot configurations' });
      }
      break;
    case 'POST':
      try {
        const { start_time, end_time, enabled } = req.body;
        const newConfig = await SlotConfig.create({ start_time, end_time, enabled });
        res.status(201).json(newConfig);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating slot configuration' });
      }
      break;
    case 'PUT':
      try {
        const { id, start_time, end_time, enabled } = req.body;
        const config = await SlotConfig.findByPk(id);
        if (!config) {
          res.status(404).json({ message: 'Slot configuration not found' });
          return;
        }
        await config.update({ start_time, end_time, enabled });
        res.status(200).json(config);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating slot configuration' });
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.body;
        const config = await SlotConfig.findByPk(id);
        if (!config) {
          res.status(404).json({ message: 'Slot configuration not found' });
          return;
        }
        await config.destroy();
        res.status(200).json({ message: 'Slot configuration deleted' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting slot configuration' });
      }
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}

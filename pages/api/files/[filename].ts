import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (typeof filename !== 'string') {
    return res.status(400).send('Invalid filename');
  }

  const filePath = path.join(STORAGE_PATH, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}

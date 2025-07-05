import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../lib/mail';
import formidable from 'formidable';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing error' });

    const email = fields.email as string;
    const file = files.file as formidable.File;

    if (!email || !file) {
      return res.status(400).json({ error: 'Missing email or file' });
    }

    const fileId = uuidv4();
    const savedPath = path.join(STORAGE_PATH, `${fileId}.pdf`);

    fs.copyFileSync(file.filepath, savedPath);

    const token = jwt.sign({ fileId, email }, JWT_SECRET, { expiresIn: '48h' });
    const signUrl = `${BASE_URL}/sign/${token}`;

    await sendEmail(email, signUrl);

    res.status(200).json({ message: 'NDA sent.' });
  });
}

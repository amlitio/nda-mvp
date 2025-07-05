import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import { sendEmail } from '../../lib/mail';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, name, signature } = req.body;
  if (!token || !name || !signature) return res.status(400).json({ error: 'Missing fields' });

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { fileId, email } = payload;
  const inputPath = path.join(STORAGE_PATH, `${fileId}.pdf`);
  const outputPath = path.join(STORAGE_PATH, `signed-${fileId}.pdf`);

  if (!fs.existsSync(inputPath)) return res.status(404).json({ error: 'Original NDA not found' });

  const existingPdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const pngImage = await pdfDoc.embedPng(signature);
  firstPage.drawImage(pngImage, { x: 50, y: 100, width: 200, height: 75 });
  firstPage.drawText(`Signed by: ${name}`, { x: 50, y: 180, size: 12, color: rgb(0, 0, 0) });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  const pdfUrl = `${BASE_URL}/api/files/signed-${fileId}.pdf`;
  await sendEmail(email, pdfUrl, true);

  return res.status(200).json({ pdfUrl });
}

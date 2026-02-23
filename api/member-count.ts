import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory member count for demo purposes
// Note: In a serverless environment, this value will reset on each cold start.
// Ideally, this should be fetched from a database.
const memberCount = 1242;

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ count: memberCount });
}

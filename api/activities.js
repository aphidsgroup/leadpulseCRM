const db = require('./_db');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { lead_id, type, text, user_name } = req.body;
      if (!lead_id || !text) {
        return res.status(400).json({ error: 'Missing lead_id or text' });
      }

      const query = `
        INSERT INTO activities (lead_id, type, text, user_name, ts)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `;
      const { rows } = await db.query(query, [lead_id, type || 'note', text, user_name || 'System']);
      
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create activity' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

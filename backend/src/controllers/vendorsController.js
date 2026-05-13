const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT v.*, u.full_name as added_by_name,
       ROUND(AVG(vr.rating), 1) as avg_rating,
       COUNT(vr.id) as rating_count
     FROM vendors v
     LEFT JOIN users u ON v.added_by = u.id
     LEFT JOIN vendor_ratings vr ON vr.vendor_id = v.id
     GROUP BY v.id, u.full_name
     ORDER BY v.created_at DESC`
  );
  res.json(rows);
}

async function create(req, res) {
  const { name, phone_number, whatsapp_link, telegram_id, vendor_type, country } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const { rows } = await pool.query(
    `INSERT INTO vendors (id, name, phone_number, whatsapp_link, telegram_id, vendor_type, country, added_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [uuidv4(), name, phone_number || null, whatsapp_link || null, telegram_id || null,
     vendor_type || null, country || null, req.user.id]
  );
  res.status(201).json({ ...rows[0], avg_rating: null, rating_count: 0, added_by_name: req.user.full_name });
}

async function update(req, res) {
  const { name, phone_number, whatsapp_link, telegram_id, vendor_type, country } = req.body;

  const { rows } = await pool.query(
    `UPDATE vendors SET name=$1, phone_number=$2, whatsapp_link=$3, telegram_id=$4,
     vendor_type=$5, country=$6 WHERE id=$7 RETURNING *`,
    [name, phone_number || null, whatsapp_link || null, telegram_id || null,
     vendor_type || null, country || null, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM vendors WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

async function getRatings(req, res) {
  const { rows } = await pool.query(
    `SELECT vr.*, u.full_name as rated_by_name
     FROM vendor_ratings vr
     LEFT JOIN users u ON vr.rated_by = u.id
     WHERE vr.vendor_id = $1
     ORDER BY vr.created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
}

async function addRating(req, res) {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 10) return res.status(400).json({ error: 'rating must be 1–10' });

  // Upsert: one rating per user per vendor
  await pool.query('DELETE FROM vendor_ratings WHERE vendor_id = $1 AND rated_by = $2', [req.params.id, req.user.id]);

  const { rows } = await pool.query(
    `INSERT INTO vendor_ratings (id, vendor_id, rating, comment, rated_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [uuidv4(), req.params.id, parseInt(rating), comment || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

module.exports = { getAll, create, update, remove, getRatings, addRating };

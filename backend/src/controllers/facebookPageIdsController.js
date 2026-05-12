const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT fp.*, u.full_name as added_by_name
     FROM facebook_page_ids fp
     LEFT JOIN users u ON fp.added_by = u.id
     ORDER BY fp.created_at DESC`
  );
  res.json(rows);
}

async function getById(req, res) {
  const { rows } = await pool.query(
    `SELECT fp.*, u.full_name as added_by_name FROM facebook_page_ids fp LEFT JOIN users u ON fp.added_by = u.id WHERE fp.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { page_name, page_link, page_id, fb_email, fb_password, page_status, connected_whatsapp, page_likes, remarks } = req.body;
  if (!page_name) return res.status(400).json({ error: 'page_name required' });

  const { rows } = await pool.query(
    `INSERT INTO facebook_page_ids (id, page_name, page_link, page_id, fb_email, fb_password, page_status, connected_whatsapp, page_likes, remarks, added_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [uuidv4(), page_name, page_link || null, page_id || null, fb_email || null,
     fb_password || null, page_status || 'New', connected_whatsapp || null, page_likes || 0, remarks || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { page_name, page_link, page_id, fb_email, fb_password, page_status, connected_whatsapp, page_likes, remarks } = req.body;

  const { rows } = await pool.query(
    `UPDATE facebook_page_ids SET page_name=$1, page_link=$2, page_id=$3, fb_email=$4,
     fb_password=$5, page_status=$6, connected_whatsapp=$7, page_likes=$8, remarks=$9
     WHERE id=$10 RETURNING *`,
    [page_name, page_link || null, page_id || null, fb_email || null,
     fb_password || null, page_status || 'New', connected_whatsapp || null, page_likes || 0, remarks || null, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM facebook_page_ids WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

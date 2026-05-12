const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT fi.*, u.full_name as added_by_name
     FROM facebook_ids fi
     LEFT JOIN users u ON fi.added_by = u.id
     ORDER BY fi.created_at DESC`
  );
  res.json(rows);
}

async function getById(req, res) {
  const { rows } = await pool.query(
    `SELECT fi.*, u.full_name as added_by_name FROM facebook_ids fi LEFT JOIN users u ON fi.added_by = u.id WHERE fi.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { facebook_name, facebook_id_link, facebook_email, facebook_password, fb_id_status, connected_whatsapp, friends_count } = req.body;
  if (!facebook_name) return res.status(400).json({ error: 'facebook_name required' });

  const { rows } = await pool.query(
    `INSERT INTO facebook_ids (id, facebook_name, facebook_id_link, facebook_email, facebook_password, fb_id_status, connected_whatsapp, friends_count, added_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [uuidv4(), facebook_name, facebook_id_link, facebook_email, facebook_password, fb_id_status || 'New', connected_whatsapp, friends_count || 0, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { facebook_name, facebook_id_link, facebook_email, facebook_password, fb_id_status, connected_whatsapp, friends_count } = req.body;
  const { rows } = await pool.query(
    `UPDATE facebook_ids SET facebook_name=$1, facebook_id_link=$2, facebook_email=$3, facebook_password=$4,
     fb_id_status=$5, connected_whatsapp=$6, friends_count=$7 WHERE id=$8 RETURNING *`,
    [facebook_name, facebook_id_link, facebook_email, facebook_password, fb_id_status, connected_whatsapp, friends_count || 0, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM facebook_ids WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

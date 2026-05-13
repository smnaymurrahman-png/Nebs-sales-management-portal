const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const isAdmin = req.user.role !== 'user';
  let query = `SELECT fi.*, u.full_name as added_by_name FROM facebook_ids fi LEFT JOIN users u ON fi.added_by = u.id`;
  const params = [];
  if (!isAdmin) {
    query += ` WHERE fi.added_by = $1`;
    params.push(req.user.id);
  }
  query += ` ORDER BY fi.created_at DESC`;
  const { rows } = await pool.query(query, params);
  res.json(rows);
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
  const isAdmin = req.user.role !== 'user';
  if (!isAdmin) {
    const { rows: check } = await pool.query('SELECT added_by FROM facebook_ids WHERE id = $1', [req.params.id]);
    if (!check.length || check[0].added_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }
  const { rows } = await pool.query(
    `UPDATE facebook_ids SET facebook_name=$1, facebook_id_link=$2, facebook_email=$3, facebook_password=$4,
     fb_id_status=$5, connected_whatsapp=$6, friends_count=$7 WHERE id=$8 RETURNING *`,
    [facebook_name, facebook_id_link, facebook_email, facebook_password, fb_id_status, connected_whatsapp, friends_count || 0, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  const isAdmin = req.user.role !== 'user';
  if (!isAdmin) {
    const { rows } = await pool.query('SELECT added_by FROM facebook_ids WHERE id = $1', [req.params.id]);
    if (!rows.length || rows[0].added_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }
  await pool.query('DELETE FROM facebook_ids WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, create, update, remove };

const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const isAdmin = req.user.role !== 'user';
  let query = `SELECT lp.*, u.full_name as added_by_name FROM linkedin_profiles lp LEFT JOIN users u ON lp.added_by = u.id`;
  const params = [];
  if (!isAdmin) {
    query += ` WHERE lp.added_by = $1`;
    params.push(req.user.id);
  }
  query += ` ORDER BY lp.created_at DESC`;
  const { rows } = await pool.query(query, params);
  res.json(rows);
}

async function create(req, res) {
  const { profile_name, profile_link, li_email, li_password, connection_count, li_status, remarks } = req.body;
  if (!profile_name) return res.status(400).json({ error: 'profile_name required' });
  const { rows } = await pool.query(
    `INSERT INTO linkedin_profiles (id, profile_name, profile_link, li_email, li_password, connection_count, li_status, remarks, added_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [uuidv4(), profile_name, profile_link || null, li_email || null, li_password || null,
     connection_count || 0, li_status || 'Active', remarks || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { profile_name, profile_link, li_email, li_password, connection_count, li_status, remarks } = req.body;
  const isAdmin = req.user.role !== 'user';
  if (!isAdmin) {
    const { rows: check } = await pool.query('SELECT added_by FROM linkedin_profiles WHERE id = $1', [req.params.id]);
    if (!check.length || check[0].added_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }
  const { rows } = await pool.query(
    `UPDATE linkedin_profiles SET profile_name=$1, profile_link=$2, li_email=$3, li_password=$4, connection_count=$5, li_status=$6, remarks=$7 WHERE id=$8 RETURNING *`,
    [profile_name, profile_link || null, li_email || null, li_password || null,
     connection_count || 0, li_status || 'Active', remarks || null, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  const isAdmin = req.user.role !== 'user';
  if (!isAdmin) {
    const { rows } = await pool.query('SELECT added_by FROM linkedin_profiles WHERE id = $1', [req.params.id]);
    if (!rows.length || rows[0].added_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }
  await pool.query('DELETE FROM linkedin_profiles WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, create, update, remove };

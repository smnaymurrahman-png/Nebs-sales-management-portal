const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT t.*, u.full_name as creator_name
     FROM tutorials t
     LEFT JOIN users u ON t.created_by = u.id
     ORDER BY t.created_at DESC`
  );
  res.json(rows);
}

async function getById(req, res) {
  const { rows } = await pool.query('SELECT * FROM tutorials WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { title, description, video_url, category } = req.body;
  if (!title || !video_url) return res.status(400).json({ error: 'title and video_url required' });

  const { rows } = await pool.query(
    'INSERT INTO tutorials (id, title, description, video_url, category, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [uuidv4(), title, description || null, video_url, category || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { title, description, video_url, category } = req.body;
  const { rows } = await pool.query(
    'UPDATE tutorials SET title=$1, description=$2, video_url=$3, category=$4 WHERE id=$5 RETURNING *',
    [title, description, video_url, category, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM tutorials WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

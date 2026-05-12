const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const [rows] = await pool.query(
    `SELECT i.*, u.full_name as creator_name
     FROM instructions i
     LEFT JOIN users u ON i.created_by = u.id
     ORDER BY i.sort_order ASC, i.created_at DESC`
  );
  res.json(rows);
}

async function getById(req, res) {
  const [rows] = await pool.query('SELECT * FROM instructions WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { title, content, category, sort_order } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const id = uuidv4();
  await pool.query(
    'INSERT INTO instructions (id, title, content, category, sort_order, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, content, category || null, sort_order || 0, req.user.id]
  );
  const [rows] = await pool.query('SELECT * FROM instructions WHERE id = ?', [id]);
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { title, content, category, sort_order } = req.body;
  await pool.query(
    'UPDATE instructions SET title=?, content=?, category=?, sort_order=? WHERE id=?',
    [title, content, category, sort_order || 0, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM instructions WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM instructions WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT dt.*, u.full_name as creator_name
     FROM daily_tasks dt
     LEFT JOIN users u ON dt.created_by = u.id
     ORDER BY dt.task_date DESC`
  );
  res.json(rows);
}

async function getToday(req, res) {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(
    `SELECT dt.*, u.full_name as creator_name
     FROM daily_tasks dt
     LEFT JOIN users u ON dt.created_by = u.id
     WHERE dt.task_date = $1`,
    [today]
  );
  res.json(rows[0] || null);
}

async function getById(req, res) {
  const { rows } = await pool.query(
    `SELECT dt.*, u.full_name as creator_name
     FROM daily_tasks dt
     LEFT JOIN users u ON dt.created_by = u.id
     WHERE dt.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { title, content, task_date } = req.body;
  if (!title || !content || !task_date) return res.status(400).json({ error: 'title, content and task_date required' });

  const { rows } = await pool.query(
    'INSERT INTO daily_tasks (id, title, content, task_date, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [uuidv4(), title, content, task_date, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { title, content, task_date } = req.body;
  const { rows } = await pool.query(
    'UPDATE daily_tasks SET title = $1, content = $2, task_date = $3 WHERE id = $4 RETURNING *',
    [title, content, task_date, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM daily_tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getToday, getById, create, update, remove };

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    'SELECT id, full_name, work_email, designation, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(rows);
}

async function create(req, res) {
  const { full_name, work_email, password, designation, role } = req.body;
  if (!full_name || !work_email || !password) return res.status(400).json({ error: 'Required fields missing' });

  if (req.user.role === 'admin' && role !== 'user') {
    return res.status(403).json({ error: 'Admins can only create users' });
  }

  const { rows: existing } = await pool.query('SELECT id FROM users WHERE work_email = $1', [work_email]);
  if (existing.length) return res.status(409).json({ error: 'Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (id, full_name, work_email, password, designation, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, work_email, designation, role',
    [uuidv4(), full_name, work_email, hash, designation || null, role || 'user']
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { id } = req.params;
  const { full_name, work_email, designation, role } = req.body;

  if (req.user.role === 'admin' && role && role !== 'user') {
    return res.status(403).json({ error: 'Admins cannot change roles to admin/super_admin' });
  }

  const { rows } = await pool.query(
    'UPDATE users SET full_name = $1, work_email = $2, designation = $3, role = $4 WHERE id = $5 RETURNING id, full_name, work_email, designation, role',
    [full_name, work_email, designation, role, id]
  );
  res.json(rows[0]);
}

async function resetPassword(req, res) {
  const { id } = req.params;
  const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'New password required' });

  const hash = await bcrypt.hash(new_password, 10);
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, id]);
  res.json({ message: 'Password reset' });
}

async function remove(req, res) {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ message: 'User deleted' });
}

module.exports = { getAll, create, update, resetPassword, remove };

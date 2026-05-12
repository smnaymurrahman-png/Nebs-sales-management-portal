const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const [rows] = await pool.query(
    'SELECT id, full_name, work_email, designation, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(rows);
}

async function create(req, res) {
  const { full_name, work_email, password, designation, role } = req.body;
  if (!full_name || !work_email || !password) return res.status(400).json({ error: 'Required fields missing' });

  // Only super_admin can create admins/super_admins
  if (req.user.role === 'admin' && role !== 'user') {
    return res.status(403).json({ error: 'Admins can only create users' });
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE work_email = ?', [work_email]);
  if (existing.length) return res.status(409).json({ error: 'Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  await pool.query(
    'INSERT INTO users (id, full_name, work_email, password, designation, role) VALUES (?, ?, ?, ?, ?, ?)',
    [id, full_name, work_email, hash, designation || null, role || 'user']
  );
  const [rows] = await pool.query('SELECT id, full_name, work_email, designation, role FROM users WHERE id = ?', [id]);
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { id } = req.params;
  const { full_name, work_email, designation, role } = req.body;

  if (req.user.role === 'admin' && role && role !== 'user') {
    return res.status(403).json({ error: 'Admins cannot change roles to admin/super_admin' });
  }

  await pool.query(
    'UPDATE users SET full_name = ?, work_email = ?, designation = ?, role = ? WHERE id = ?',
    [full_name, work_email, designation, role, id]
  );
  const [rows] = await pool.query('SELECT id, full_name, work_email, designation, role FROM users WHERE id = ?', [id]);
  res.json(rows[0]);
}

async function resetPassword(req, res) {
  const { id } = req.params;
  const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'New password required' });

  const hash = await bcrypt.hash(new_password, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
  res.json({ message: 'Password reset' });
}

async function remove(req, res) {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
  res.json({ message: 'User deleted' });
}

module.exports = { getAll, create, update, resetPassword, remove };

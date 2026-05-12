const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function login(req, res) {
  const { work_email, password } = req.body;
  if (!work_email || !password) return res.status(400).json({ error: 'Email and password required' });

  const { rows } = await pool.query('SELECT * FROM users WHERE work_email = $1', [work_email]);
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role, full_name: user.full_name, work_email: user.work_email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  delete user.password;
  res.json({ token, user });
}

async function me(req, res) {
  const { rows } = await pool.query(
    'SELECT id, full_name, work_email, designation, role, shift, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(rows[0]);
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'All fields required' });

  const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
  const valid = await bcrypt.compare(current_password, rows[0].password);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

  const hash = await bcrypt.hash(new_password, 10);
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
  res.json({ message: 'Password changed' });
}

async function updateProfile(req, res) {
  const { full_name, designation } = req.body;
  const { rows } = await pool.query(
    'UPDATE users SET full_name = $1, designation = $2 WHERE id = $3 RETURNING id, full_name, work_email, designation, role',
    [full_name, designation, req.user.id]
  );
  res.json(rows[0]);
}

module.exports = { login, me, changePassword, updateProfile };

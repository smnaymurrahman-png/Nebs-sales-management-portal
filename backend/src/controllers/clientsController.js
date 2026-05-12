const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const [rows] = await pool.query(
    `SELECT c.*, u.full_name as added_by_name
     FROM clients c
     LEFT JOIN users u ON c.added_by = u.id
     ORDER BY c.created_at DESC`
  );
  res.json(rows);
}

async function getById(req, res) {
  const [rows] = await pool.query(
    `SELECT c.*, u.full_name as added_by_name FROM clients c LEFT JOIN users u ON c.added_by = u.id WHERE c.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { client_name, whatsapp_number, data_requirements, type, quantity } = req.body;
  if (!client_name || !type) return res.status(400).json({ error: 'client_name and type required' });

  const id = uuidv4();
  await pool.query(
    `INSERT INTO clients (id, client_name, whatsapp_number, data_requirements, type, quantity, added_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, client_name, whatsapp_number || null, data_requirements || null, type, quantity || 0, req.user.id]
  );
  const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const {
    client_name, whatsapp_number, data_requirements, type, quantity,
    sample_taken, order_completed, badge, last_message, remarks
  } = req.body;

  await pool.query(
    `UPDATE clients SET client_name=?, whatsapp_number=?, data_requirements=?, type=?, quantity=?,
     sample_taken=?, order_completed=?, badge=?, last_message=?, remarks=?
     WHERE id=?`,
    [client_name, whatsapp_number, data_requirements, type, quantity,
     sample_taken ? 1 : 0, order_completed ? 1 : 0, badge, last_message, remarks, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

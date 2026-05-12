const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT c.*, u.full_name as added_by_name
     FROM clients c
     LEFT JOIN users u ON c.added_by = u.id
     ORDER BY c.created_at DESC`
  );
  res.json(rows);
}

async function getById(req, res) {
  const { rows } = await pool.query(
    `SELECT c.*, u.full_name as added_by_name FROM clients c LEFT JOIN users u ON c.added_by = u.id WHERE c.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { client_name, whatsapp_number, data_requirements, type, quantity } = req.body;
  if (!client_name || !type) return res.status(400).json({ error: 'client_name and type required' });

  const { rows } = await pool.query(
    `INSERT INTO clients (id, client_name, whatsapp_number, data_requirements, type, quantity, added_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [uuidv4(), client_name, whatsapp_number || null, data_requirements || null, type, quantity || 0, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const {
    client_name, whatsapp_number, data_requirements, type, quantity,
    sample_taken, order_completed, badge, last_message, remarks
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE clients SET client_name=$1, whatsapp_number=$2, data_requirements=$3, type=$4, quantity=$5,
     sample_taken=$6, order_completed=$7, badge=$8, last_message=$9, remarks=$10
     WHERE id=$11 RETURNING *`,
    [client_name, whatsapp_number, data_requirements, type, quantity,
     !!sample_taken, !!order_completed, badge, last_message, remarks, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

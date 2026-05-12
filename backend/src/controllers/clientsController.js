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
  const { client_name, whatsapp_number, whatsapp_link, data_requirements, type, quantity } = req.body;
  if (!client_name || !type) return res.status(400).json({ error: 'client_name and type required' });

  const { rows } = await pool.query(
    `INSERT INTO clients (id, client_name, whatsapp_number, whatsapp_link, data_requirements, type, quantity, added_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [uuidv4(), client_name, whatsapp_number || null, whatsapp_link || null, data_requirements || null, type, quantity || 0, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const {
    client_name, whatsapp_number, whatsapp_link, data_requirements, type, quantity,
    sample_taken, order_completed, badge, last_message, last_message_image, remarks
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE clients SET client_name=$1, whatsapp_number=$2, whatsapp_link=$3, data_requirements=$4,
     type=$5, quantity=$6, sample_taken=$7, order_completed=$8, badge=$9,
     last_message=$10, last_message_image=$11, remarks=$12
     WHERE id=$13 RETURNING *`,
    [client_name, whatsapp_number, whatsapp_link, data_requirements, type,
     quantity || 0, parseInt(sample_taken) || 0, parseInt(order_completed) || 0,
     badge, last_message, last_message_image || null, remarks, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

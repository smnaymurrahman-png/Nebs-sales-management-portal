const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT wg.*, u.full_name as added_by_name
     FROM whatsapp_groups wg
     LEFT JOIN users u ON wg.added_by = u.id
     ORDER BY wg.created_at DESC`
  );
  res.json(rows);
}

async function getById(req, res) {
  const { rows } = await pool.query(
    `SELECT wg.*, u.full_name as added_by_name FROM whatsapp_groups wg LEFT JOIN users u ON wg.added_by = u.id WHERE wg.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { group_name, group_link, admin_whatsapp, group_members, group_type, activity_status } = req.body;
  if (!group_name) return res.status(400).json({ error: 'group_name required' });

  const { rows } = await pool.query(
    `INSERT INTO whatsapp_groups (id, group_name, group_link, admin_whatsapp, group_members, group_type, activity_status, added_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [uuidv4(), group_name, group_link, admin_whatsapp, group_members || 0, group_type, activity_status, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { group_name, group_link, admin_whatsapp, group_members, group_type, activity_status } = req.body;
  const { rows } = await pool.query(
    `UPDATE whatsapp_groups SET group_name=$1, group_link=$2, admin_whatsapp=$3, group_members=$4, group_type=$5, activity_status=$6
     WHERE id=$7 RETURNING *`,
    [group_name, group_link, admin_whatsapp, group_members || 0, group_type, activity_status, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM whatsapp_groups WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

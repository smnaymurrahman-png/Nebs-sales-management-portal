const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT wi.*, u.full_name as added_by_name FROM whatsapp_ids wi LEFT JOIN users u ON wi.added_by = u.id WHERE wi.added_by = $1 ORDER BY wi.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}

async function create(req, res) {
  const { whatsapp_name, whatsapp_number, whatsapp_link, wa_email, wa_password, wa_status, connected_fb_id, device, remarks } = req.body;
  if (!whatsapp_name) return res.status(400).json({ error: 'whatsapp_name required' });
  const { rows } = await pool.query(
    `INSERT INTO whatsapp_ids (id, whatsapp_name, whatsapp_number, whatsapp_link, wa_email, wa_password, wa_status, connected_fb_id, device, remarks, added_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [uuidv4(), whatsapp_name, whatsapp_number || null, whatsapp_link || null, wa_email || null,
     wa_password || null, wa_status || 'New', connected_fb_id || null, device || null, remarks || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { whatsapp_name, whatsapp_number, whatsapp_link, wa_email, wa_password, wa_status, connected_fb_id, device, remarks } = req.body;
  const { rows: check } = await pool.query('SELECT added_by FROM whatsapp_ids WHERE id = $1', [req.params.id]);
  if (!check.length || check[0].added_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const { rows } = await pool.query(
    `UPDATE whatsapp_ids SET whatsapp_name=$1, whatsapp_number=$2, whatsapp_link=$3, wa_email=$4,
     wa_password=$5, wa_status=$6, connected_fb_id=$7, device=$8, remarks=$9
     WHERE id=$10 RETURNING *`,
    [whatsapp_name, whatsapp_number || null, whatsapp_link || null, wa_email || null,
     wa_password || null, wa_status || 'New', connected_fb_id || null, device || null, remarks || null, req.params.id]
  );
  res.json(rows[0]);
}

async function remove(req, res) {
  const { rows } = await pool.query('SELECT added_by FROM whatsapp_ids WHERE id = $1', [req.params.id]);
  if (!rows.length || rows[0].added_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('DELETE FROM whatsapp_ids WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, create, update, remove };

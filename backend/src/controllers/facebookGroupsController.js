const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows: groups } = await pool.query(
    `SELECT fg.*, u.full_name as added_by_name
     FROM facebook_groups fg
     LEFT JOIN users u ON fg.added_by = u.id
     ORDER BY fg.created_at DESC`
  );
  const { rows: admins } = await pool.query('SELECT * FROM facebook_group_admins');
  const groupAdminsMap = {};
  admins.forEach(a => {
    if (!groupAdminsMap[a.group_id]) groupAdminsMap[a.group_id] = [];
    groupAdminsMap[a.group_id].push(a.admin_name);
  });
  res.json(groups.map(g => ({ ...g, admins: groupAdminsMap[g.id] || [] })));
}

async function getById(req, res) {
  const { rows: groups } = await pool.query(
    `SELECT fg.*, u.full_name as added_by_name FROM facebook_groups fg LEFT JOIN users u ON fg.added_by = u.id WHERE fg.id = $1`,
    [req.params.id]
  );
  if (!groups.length) return res.status(404).json({ error: 'Not found' });
  const { rows: admins } = await pool.query('SELECT admin_name FROM facebook_group_admins WHERE group_id = $1', [req.params.id]);
  res.json({ ...groups[0], admins: admins.map(a => a.admin_name) });
}

async function create(req, res) {
  const {
    group_name, group_link, group_type, group_members, group_current_status,
    owner_fb_id_name, owner_fb_id_link, backup_group_link, group_status, admins
  } = req.body;
  if (!group_name) return res.status(400).json({ error: 'group_name required' });

  const id = uuidv4();
  await pool.query(
    `INSERT INTO facebook_groups (id, group_name, group_link, group_type, group_members, group_current_status,
     owner_fb_id_name, owner_fb_id_link, backup_group_link, group_status, added_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [id, group_name, group_link, group_type, group_members || 0, group_current_status,
     owner_fb_id_name, owner_fb_id_link, backup_group_link, group_status, req.user.id]
  );

  if (Array.isArray(admins) && admins.length) {
    for (const name of admins) {
      if (name) await pool.query('INSERT INTO facebook_group_admins (id, group_id, admin_name) VALUES ($1, $2, $3)', [uuidv4(), id, name]);
    }
  }

  const { rows } = await pool.query('SELECT * FROM facebook_groups WHERE id = $1', [id]);
  const { rows: adminRows } = await pool.query('SELECT admin_name FROM facebook_group_admins WHERE group_id = $1', [id]);
  res.status(201).json({ ...rows[0], admins: adminRows.map(a => a.admin_name) });
}

async function update(req, res) {
  const {
    group_name, group_link, group_type, group_members, group_current_status,
    owner_fb_id_name, owner_fb_id_link, backup_group_link, group_status, admins
  } = req.body;
  const { id } = req.params;

  await pool.query(
    `UPDATE facebook_groups SET group_name=$1, group_link=$2, group_type=$3, group_members=$4,
     group_current_status=$5, owner_fb_id_name=$6, owner_fb_id_link=$7, backup_group_link=$8, group_status=$9
     WHERE id=$10`,
    [group_name, group_link, group_type, group_members || 0, group_current_status,
     owner_fb_id_name, owner_fb_id_link, backup_group_link, group_status, id]
  );

  if (Array.isArray(admins)) {
    await pool.query('DELETE FROM facebook_group_admins WHERE group_id = $1', [id]);
    for (const name of admins) {
      if (name) await pool.query('INSERT INTO facebook_group_admins (id, group_id, admin_name) VALUES ($1, $2, $3)', [uuidv4(), id, name]);
    }
  }

  const { rows } = await pool.query('SELECT * FROM facebook_groups WHERE id = $1', [id]);
  const { rows: adminRows } = await pool.query('SELECT admin_name FROM facebook_group_admins WHERE group_id = $1', [id]);
  res.json({ ...rows[0], admins: adminRows.map(a => a.admin_name) });
}

async function remove(req, res) {
  await pool.query('DELETE FROM facebook_groups WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, getById, create, update, remove };

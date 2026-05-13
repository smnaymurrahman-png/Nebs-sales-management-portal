const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT lg.*, u.full_name as added_by_name FROM linkedin_groups lg LEFT JOIN users u ON lg.added_by = u.id ORDER BY lg.created_at DESC`
  );
  res.json(rows);
}

async function create(req, res) {
  const { group_name, group_link, group_type, group_members, group_condition } = req.body;
  if (!group_name) return res.status(400).json({ error: 'group_name required' });

  const { rows: nameCheck } = await pool.query(
    `SELECT group_name FROM linkedin_groups WHERE LOWER(TRIM(group_name)) = LOWER(TRIM($1))`, [group_name]
  );
  if (nameCheck.length) return res.status(409).json({ error: `A group named "${nameCheck[0].group_name}" already exists` });

  if (group_link) {
    const { rows: linkCheck } = await pool.query(
      `SELECT group_name FROM linkedin_groups WHERE LOWER(REGEXP_REPLACE(TRIM(group_link), '/$', '')) = LOWER(REGEXP_REPLACE(TRIM($1), '/$', ''))`, [group_link]
    );
    if (linkCheck.length) return res.status(409).json({ error: `This link already exists as "${linkCheck[0].group_name}"` });
  }

  const { rows } = await pool.query(
    `INSERT INTO linkedin_groups (id, group_name, group_link, group_type, group_members, group_condition, added_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [uuidv4(), group_name, group_link || null, group_type || null, group_members || 0, group_condition || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

async function update(req, res) {
  const { group_name, group_link, group_type, group_members, group_condition } = req.body;
  const { id } = req.params;

  const { rows: nameCheck } = await pool.query(
    `SELECT group_name FROM linkedin_groups WHERE LOWER(TRIM(group_name)) = LOWER(TRIM($1)) AND id != $2`, [group_name, id]
  );
  if (nameCheck.length) return res.status(409).json({ error: `A group named "${nameCheck[0].group_name}" already exists` });

  if (group_link) {
    const { rows: linkCheck } = await pool.query(
      `SELECT group_name FROM linkedin_groups WHERE LOWER(REGEXP_REPLACE(TRIM(group_link), '/$', '')) = LOWER(REGEXP_REPLACE(TRIM($1), '/$', '')) AND id != $2`, [group_link, id]
    );
    if (linkCheck.length) return res.status(409).json({ error: `This link already exists as "${linkCheck[0].group_name}"` });
  }

  const { rows } = await pool.query(
    `UPDATE linkedin_groups SET group_name=$1, group_link=$2, group_type=$3, group_members=$4, group_condition=$5 WHERE id=$6 RETURNING *`,
    [group_name, group_link || null, group_type || null, group_members || 0, group_condition || null, id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}

async function remove(req, res) {
  await pool.query('DELETE FROM linkedin_groups WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
}

module.exports = { getAll, create, update, remove };

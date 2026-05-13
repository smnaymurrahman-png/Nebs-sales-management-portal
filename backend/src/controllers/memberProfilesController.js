const pool = require('../config/database');

async function getMemberProfiles(req, res) {
  const { userId } = req.params;
  const [user, fbIds, waIds, fbPages, liProfiles] = await Promise.all([
    pool.query(`SELECT id, full_name, work_email, designation, role, shift FROM users WHERE id = $1`, [userId]),
    pool.query(`SELECT * FROM facebook_ids WHERE added_by = $1 ORDER BY created_at DESC`, [userId]),
    pool.query(`SELECT * FROM whatsapp_ids WHERE added_by = $1 ORDER BY created_at DESC`, [userId]),
    pool.query(`SELECT * FROM facebook_page_ids WHERE added_by = $1 ORDER BY created_at DESC`, [userId]),
    pool.query(`SELECT * FROM linkedin_profiles WHERE added_by = $1 ORDER BY created_at DESC`, [userId]),
  ]);
  if (!user.rows.length) return res.status(404).json({ error: 'Member not found' });
  res.json({
    user: user.rows[0],
    facebook_ids: fbIds.rows,
    whatsapp_ids: waIds.rows,
    facebook_pages: fbPages.rows,
    linkedin_profiles: liProfiles.rows,
  });
}

module.exports = { getMemberProfiles };

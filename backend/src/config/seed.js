const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nebs_seller_portal',
  });

  const [existing] = await conn.query('SELECT id FROM users WHERE work_email = ?', ['admin@nebs.com']);
  if (existing.length > 0) {
    console.log('Seed data already exists.');
    await conn.end();
    return;
  }

  const hash = await bcrypt.hash('Admin@1234', 10);
  await conn.query(
    'INSERT INTO users (id, full_name, work_email, password, designation, role) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'Super Admin', 'admin@nebs.com', hash, 'Super Administrator', 'super_admin']
  );

  console.log('Seed complete. Login: admin@nebs.com / Admin@1234');
  await conn.end();
}

seed().catch(err => { console.error(err); process.exit(1); });

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seed() {
  const pool = new Pool(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'nebs_seller_portal',
        }
  );

  const { rows } = await pool.query('SELECT id FROM users WHERE work_email = $1', ['admin@nebs.com']);
  if (rows.length > 0) {
    console.log('Seed data already exists.');
    await pool.end();
    return;
  }

  const hash = await bcrypt.hash('Admin@1234', 10);
  await pool.query(
    'INSERT INTO users (id, full_name, work_email, password, designation, role) VALUES ($1, $2, $3, $4, $5, $6)',
    [uuidv4(), 'Super Admin', 'admin@nebs.com', hash, 'Super Administrator', 'super_admin']
  );

  console.log('Seed complete. Login: admin@nebs.com / Admin@1234');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });

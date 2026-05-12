require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3001',
  'https://nebs-seller-portal.vercel.app',
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/daily-task', require('./routes/dailyTask'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/facebook-groups', require('./routes/facebookGroups'));
app.use('/api/facebook-ids', require('./routes/facebookIds'));
app.use('/api/whatsapp-groups', require('./routes/whatsappGroups'));
app.use('/api/instructions', require('./routes/instructions'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/whatsapp-ids', require('./routes/whatsappIds'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      work_email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      designation VARCHAR(255),
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('super_admin','admin','user')),
      shift VARCHAR(20) DEFAULT 'Morning' CHECK (shift IN ('Morning','Evening','Day')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(20) DEFAULT 'Morning'`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      task_date DATE NOT NULL,
      created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id VARCHAR(36) PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      whatsapp_number VARCHAR(50),
      whatsapp_link VARCHAR(500),
      data_requirements TEXT,
      type VARCHAR(20) NOT NULL CHECK (type IN ('Blaster','Reseller','Owner')),
      quantity INT DEFAULT 0,
      sample_taken INT DEFAULT 0,
      order_completed INT DEFAULT 0,
      badge VARCHAR(100),
      last_message TEXT,
      last_message_image TEXT,
      remarks TEXT,
      added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Migrate existing clients table to add new columns
  await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS whatsapp_link VARCHAR(500)`);
  await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_message_image TEXT`);
  await pool.query(`
    DO $$ BEGIN
      IF (SELECT data_type FROM information_schema.columns
          WHERE table_name='clients' AND column_name='sample_taken') = 'boolean' THEN
        ALTER TABLE clients ALTER COLUMN sample_taken DROP DEFAULT;
        ALTER TABLE clients ALTER COLUMN order_completed DROP DEFAULT;
        ALTER TABLE clients ALTER COLUMN sample_taken TYPE INT USING (sample_taken::int);
        ALTER TABLE clients ALTER COLUMN order_completed TYPE INT USING (order_completed::int);
        ALTER TABLE clients ALTER COLUMN sample_taken SET DEFAULT 0;
        ALTER TABLE clients ALTER COLUMN order_completed SET DEFAULT 0;
      END IF;
    END $$
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS facebook_groups (
      id VARCHAR(36) PRIMARY KEY,
      group_name VARCHAR(255) NOT NULL,
      group_link VARCHAR(1000),
      group_type VARCHAR(100),
      group_members INT DEFAULT 0,
      group_current_status VARCHAR(100),
      owner_fb_id_name VARCHAR(255),
      owner_fb_id_link VARCHAR(1000),
      backup_group_link VARCHAR(1000),
      group_status VARCHAR(100),
      group_condition VARCHAR(100),
      added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`ALTER TABLE facebook_groups ADD COLUMN IF NOT EXISTS group_condition VARCHAR(100)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS facebook_group_admins (
      id VARCHAR(36) PRIMARY KEY,
      group_id VARCHAR(36) NOT NULL REFERENCES facebook_groups(id) ON DELETE CASCADE,
      admin_name VARCHAR(255)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS facebook_ids (
      id VARCHAR(36) PRIMARY KEY,
      facebook_name VARCHAR(255) NOT NULL,
      facebook_id_link VARCHAR(1000),
      facebook_email VARCHAR(255),
      facebook_password VARCHAR(255),
      fb_id_status VARCHAR(20) DEFAULT 'New' CHECK (fb_id_status IN ('New','Active','Disabled')),
      connected_whatsapp VARCHAR(50),
      friends_count INT DEFAULT 0,
      added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_groups (
      id VARCHAR(36) PRIMARY KEY,
      group_name VARCHAR(255) NOT NULL,
      group_link VARCHAR(1000),
      admin_whatsapp VARCHAR(50),
      group_members INT DEFAULT 0,
      group_type VARCHAR(100),
      activity_status VARCHAR(100),
      added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_ids (
      id VARCHAR(36) PRIMARY KEY,
      whatsapp_name VARCHAR(255) NOT NULL,
      whatsapp_number VARCHAR(50),
      whatsapp_link VARCHAR(500),
      wa_email VARCHAR(255),
      wa_password VARCHAR(255),
      wa_status VARCHAR(20) DEFAULT 'New' CHECK (wa_status IN ('New','Active','Disabled','Banned')),
      connected_fb_id VARCHAR(255),
      device VARCHAR(255),
      remarks TEXT,
      added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS instructions (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100),
      sort_order INT DEFAULT 0,
      created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tutorials (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_url VARCHAR(1000) NOT NULL,
      category VARCHAR(100),
      created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default super admin if no users exist
  const { rows } = await pool.query('SELECT id FROM users LIMIT 1');
  if (!rows.length) {
    const hash = await bcrypt.hash('Admin@1234', 10);
    await pool.query(
      'INSERT INTO users (id, full_name, work_email, password, designation, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [uuidv4(), 'Super Admin', 'admin@nebs.com', hash, 'Super Administrator', 'super_admin']
    );
    console.log('Default admin created: admin@nebs.com / Admin@1234');
  }

  console.log('Database ready.');
}

const PORT = process.env.PORT || 5001;
initDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => { console.error('DB init failed:', err); process.exit(1); });

const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      work_email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      designation VARCHAR(255),
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('super_admin','admin','user')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
      data_requirements TEXT,
      type VARCHAR(20) NOT NULL CHECK (type IN ('Blaster','Reseller','Owner')),
      quantity INT DEFAULT 0,
      sample_taken BOOLEAN DEFAULT FALSE,
      order_completed BOOLEAN DEFAULT FALSE,
      badge VARCHAR(100),
      last_message TEXT,
      remarks TEXT,
      added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
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
      added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  console.log('Migration complete.');
  await pool.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });

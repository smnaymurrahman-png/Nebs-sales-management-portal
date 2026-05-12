const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'nebs_seller_portal'}\``);
  await conn.query(`USE \`${process.env.DB_NAME || 'nebs_seller_portal'}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      work_email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      designation VARCHAR(255),
      role ENUM('super_admin','admin','user') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      task_date DATE NOT NULL,
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id VARCHAR(36) PRIMARY KEY,
      client_name VARCHAR(255) NOT NULL,
      whatsapp_number VARCHAR(50),
      data_requirements TEXT,
      type ENUM('Blaster','Reseller','Owner') NOT NULL,
      quantity INT DEFAULT 0,
      sample_taken TINYINT(1) DEFAULT 0,
      order_completed TINYINT(1) DEFAULT 0,
      badge VARCHAR(100),
      last_message TEXT,
      remarks TEXT,
      added_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
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
      added_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS facebook_group_admins (
      id VARCHAR(36) PRIMARY KEY,
      group_id VARCHAR(36) NOT NULL,
      admin_name VARCHAR(255),
      FOREIGN KEY (group_id) REFERENCES facebook_groups(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS facebook_ids (
      id VARCHAR(36) PRIMARY KEY,
      facebook_name VARCHAR(255) NOT NULL,
      facebook_id_link VARCHAR(1000),
      facebook_email VARCHAR(255),
      facebook_password VARCHAR(255),
      fb_id_status ENUM('New','Active','Disabled') DEFAULT 'New',
      connected_whatsapp VARCHAR(50),
      friends_count INT DEFAULT 0,
      added_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_groups (
      id VARCHAR(36) PRIMARY KEY,
      group_name VARCHAR(255) NOT NULL,
      group_link VARCHAR(1000),
      admin_whatsapp VARCHAR(50),
      group_members INT DEFAULT 0,
      group_type VARCHAR(100),
      activity_status VARCHAR(100),
      added_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS instructions (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      category VARCHAR(100),
      sort_order INT DEFAULT 0,
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tutorials (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_url VARCHAR(1000) NOT NULL,
      category VARCHAR(100),
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  console.log('Migration complete.');
  await conn.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });

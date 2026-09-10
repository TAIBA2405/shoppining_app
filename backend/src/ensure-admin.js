// Shared admin seeder — imported by both index.js (boot) and seed.js
// (one-time import). Kept separate so seed.js doesn't boot the server.
import bcrypt from 'bcryptjs'
import { pool } from './db.js'

export async function ensureAdmin() {
  const email = 'admin@styleverse.com'
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (rows.length) return false
  const hash = await bcrypt.hash('admin123', 10)
  await pool.query(
    `INSERT INTO users (id, name, email, phone, password, is_admin)
     VALUES ('admin-001','Admin',$1,'9999999999',$2,TRUE)`,
    [email, hash]
  )
  console.log('✅ admin account seeded (admin@styleverse.com / admin123)')
  return true
}

const bcrypt = require('bcryptjs');
const pool   = require('./index');

async function seed() {
  const hash = await bcrypt.hash('user123', 10);

  await pool.query(`
    INSERT INTO users (email, password_hash, name, department)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          name          = EXCLUDED.name
  `, ['user@indigo.com', hash, 'IndiGo User', 'Digital']);

  await pool.query(`
    INSERT INTO users (email, password_hash, name, department)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          name          = EXCLUDED.name
  `, ['ai@indigo.com', hash, 'AI Studio User', 'AI & Innovation']);

  console.log('✅ Seed complete');
  console.log('   user@indigo.com / user123');
  console.log('   ai@indigo.com   / user123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

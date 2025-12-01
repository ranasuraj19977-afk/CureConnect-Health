/**
 * SQLite helper using better-sqlite3
 */
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'data', 'easydoc.db'));
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// create table if not exists
db.prepare(`CREATE TABLE IF NOT EXISTS consults (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  age INTEGER,
  contact TEXT,
  message TEXT,
  type TEXT,
  meta TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

function saveConsult({name, age = null, contact, message = null, type = 'text', meta = null}) {
  const stmt = db.prepare('INSERT INTO consults (name, age, contact, message, type, meta) VALUES (?, ?, ?, ?, ?, ?)');
  const info = stmt.run(name, age, contact, message, type, meta);
  return info.lastInsertRowid;
}

module.exports = { saveConsult, db };

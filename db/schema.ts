import * as SQLite from 'expo-sqlite';

const DB_NAME = 'afteris.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      goals TEXT DEFAULT '[]',
      artie_mode TEXT DEFAULT 'calm',
      reminder_enabled INTEGER DEFAULT 1,
      reminder_time TEXT DEFAULT '09:00',
      is_subscribed INTEGER DEFAULT 0,
      has_completed_onboarding INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS compounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dose_mcg REAL,
      frequency TEXT DEFAULT 'daily',
      start_date TEXT,
      active INTEGER DEFAULT 1,
      vial_size_mg REAL,
      bac_water_ml REAL,
      half_life_hours REAL,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS injection_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compound_id INTEGER NOT NULL,
      logged_at TEXT NOT NULL,
      dose_mcg REAL NOT NULL,
      site TEXT DEFAULT '',
      is_late_log INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      FOREIGN KEY (compound_id) REFERENCES compounds(id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_slug TEXT NOT NULL UNIQUE,
      bookmarked_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_concentrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compound_id INTEGER,
      vial_mg REAL NOT NULL,
      bac_water_ml REAL NOT NULL,
      dose_mcg REAL,
      saved_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (compound_id) REFERENCES compounds(id)
    );
  `);
}

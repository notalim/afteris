import type { SQLiteBindValue } from 'expo-sqlite';
import { getDatabase } from './schema';
import type { User, Compound, InjectionLog, Bookmark, SavedConcentration } from '@/types';

// ─── User ──────────────────────────────────────────────

export async function getUser(): Promise<User | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
  return result ?? null;
}

export async function createUser(name: string, goals: string[], artieMode: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO users (name, goals, artie_mode) VALUES (?, ?, ?)',
    name,
    JSON.stringify(goals),
    artieMode
  );
}

export async function updateUser(updates: Partial<User>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'created_at') continue;
    fields.push(`${key} = ?`);
    values.push(value as SQLiteBindValue);
  }

  if (fields.length === 0) return;

  await db.runAsync(
    `UPDATE users SET ${fields.join(', ')} WHERE id = (SELECT id FROM users LIMIT 1)`,
    ...values
  );
}

// ─── Compounds ─────────────────────────────────────────

export async function getCompounds(activeOnly = true): Promise<Compound[]> {
  const db = await getDatabase();
  const query = activeOnly
    ? 'SELECT * FROM compounds WHERE active = 1 ORDER BY created_at DESC'
    : 'SELECT * FROM compounds ORDER BY created_at DESC';
  return db.getAllAsync<Compound>(query);
}

export async function addCompound(compound: Omit<Compound, 'id' | 'created_at'>): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO compounds (name, dose_mcg, frequency, start_date, active, vial_size_mg, bac_water_ml, half_life_hours, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    compound.name,
    compound.dose_mcg,
    compound.frequency,
    compound.start_date,
    compound.active,
    compound.vial_size_mg,
    compound.bac_water_ml,
    compound.half_life_hours,
    compound.notes
  );
  return result.lastInsertRowId;
}

export async function updateCompound(id: number, updates: Partial<Compound>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: SQLiteBindValue[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'created_at') continue;
    fields.push(`${key} = ?`);
    values.push(value as SQLiteBindValue);
  }

  if (fields.length === 0) return;
  values.push(id);

  await db.runAsync(`UPDATE compounds SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deleteCompound(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE compounds SET active = 0 WHERE id = ?', id);
}

// ─── Injection Log ─────────────────────────────────────

export async function logInjection(log: Omit<InjectionLog, 'id'>): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO injection_log (compound_id, logged_at, dose_mcg, site, is_late_log, notes) VALUES (?, ?, ?, ?, ?, ?)',
    log.compound_id,
    log.logged_at,
    log.dose_mcg,
    log.site,
    log.is_late_log,
    log.notes
  );
  return result.lastInsertRowId;
}

export async function getLogsForDate(date: string): Promise<InjectionLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<InjectionLog>(
    "SELECT * FROM injection_log WHERE date(logged_at) = date(?) ORDER BY logged_at DESC",
    date
  );
}

export async function getLogsForCompound(compoundId: number): Promise<InjectionLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<InjectionLog>(
    'SELECT * FROM injection_log WHERE compound_id = ? ORDER BY logged_at DESC',
    compoundId
  );
}

export async function getLogsBetweenDates(startDate: string, endDate: string): Promise<InjectionLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<InjectionLog>(
    "SELECT * FROM injection_log WHERE date(logged_at) BETWEEN date(?) AND date(?) ORDER BY logged_at DESC",
    startDate,
    endDate
  );
}

export async function getStreak(): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ log_date: string }>(
    "SELECT DISTINCT date(logged_at) as log_date FROM injection_log ORDER BY log_date DESC"
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];

    if (rows[i].log_date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ─── Bookmarks ─────────────────────────────────────────

export async function toggleBookmark(articleSlug: string): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<Bookmark>(
    'SELECT * FROM bookmarks WHERE article_slug = ?',
    articleSlug
  );

  if (existing) {
    await db.runAsync('DELETE FROM bookmarks WHERE article_slug = ?', articleSlug);
    return false;
  } else {
    await db.runAsync('INSERT INTO bookmarks (article_slug) VALUES (?)', articleSlug);
    return true;
  }
}

export async function isBookmarked(articleSlug: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Bookmark>(
    'SELECT * FROM bookmarks WHERE article_slug = ?',
    articleSlug
  );
  return result !== null;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const db = await getDatabase();
  return db.getAllAsync<Bookmark>('SELECT * FROM bookmarks ORDER BY bookmarked_at DESC');
}

// ─── Saved Concentrations ──────────────────────────────

export async function saveConcentration(
  concentration: Omit<SavedConcentration, 'id' | 'saved_at'>
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO saved_concentrations (compound_id, vial_mg, bac_water_ml, dose_mcg) VALUES (?, ?, ?, ?)',
    concentration.compound_id,
    concentration.vial_mg,
    concentration.bac_water_ml,
    concentration.dose_mcg
  );
  return result.lastInsertRowId;
}

export async function getSavedConcentrations(): Promise<SavedConcentration[]> {
  const db = await getDatabase();
  return db.getAllAsync<SavedConcentration>(
    'SELECT * FROM saved_concentrations ORDER BY saved_at DESC'
  );
}

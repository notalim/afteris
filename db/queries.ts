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

// ─── Demo Data Seeding ──────────────────────────────────

export async function seedDemoData(): Promise<void> {
  const db = await getDatabase();

  // Check if we already have compounds — don't double-seed
  const existing = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM compounds'
  );
  if (existing && existing.cnt > 0) return;

  // Sample compounds
  const compounds = [
    { name: 'BPC-157', dose_mcg: 250, frequency: 'Daily', half_life_hours: 4, vial_size_mg: 5, bac_water_ml: 2 },
    { name: 'TB-500', dose_mcg: 2500, frequency: 'Twice weekly', half_life_hours: 72, vial_size_mg: 5, bac_water_ml: 2 },
    { name: 'Ipamorelin', dose_mcg: 200, frequency: 'Daily', half_life_hours: 2, vial_size_mg: 5, bac_water_ml: 2.5 },
    { name: 'CJC-1295', dose_mcg: 100, frequency: 'Every other day', half_life_hours: 144, vial_size_mg: 2, bac_water_ml: 2 },
  ];

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 60);
  const startDateStr = startDate.toISOString().split('T')[0];

  const compoundIds: number[] = [];
  for (const c of compounds) {
    const result = await db.runAsync(
      `INSERT INTO compounds (name, dose_mcg, frequency, start_date, active, vial_size_mg, bac_water_ml, half_life_hours, notes)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, '')`,
      c.name,
      c.dose_mcg,
      c.frequency,
      startDateStr,
      c.vial_size_mg,
      c.bac_water_ml,
      c.half_life_hours
    );
    compoundIds.push(result.lastInsertRowId);
  }

  // Generate ~60 days of random injection logs
  const sites = ['Abdomen', 'Thigh', 'Deltoid', 'Glute'];
  for (let dayOffset = 60; dayOffset >= 0; dayOffset--) {
    const logDate = new Date(today);
    logDate.setDate(logDate.getDate() - dayOffset);
    const dateStr = logDate.toISOString().split('T')[0];

    // Randomly decide how many logs this day (0-3)
    const rand = Math.random();
    let numLogs = 0;
    if (rand < 0.15) numLogs = 0;       // 15% skip day
    else if (rand < 0.45) numLogs = 1;  // 30% one log
    else if (rand < 0.80) numLogs = 2;  // 35% two logs
    else numLogs = 3;                    // 20% three logs

    for (let i = 0; i < numLogs; i++) {
      const compoundIdx = Math.floor(Math.random() * compoundIds.length);
      const site = sites[Math.floor(Math.random() * sites.length)];
      const compId = compoundIds[compoundIdx];
      const comp = compounds[compoundIdx];

      await db.runAsync(
        'INSERT INTO injection_log (compound_id, logged_at, dose_mcg, site, is_late_log, notes) VALUES (?, ?, ?, ?, 0, ?)',
        compId,
        dateStr + 'T09:00:00',
        comp.dose_mcg,
        site,
        ''
      );
    }
  }
}

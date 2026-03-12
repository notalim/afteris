export interface User {
  id: number;
  name: string;
  goals: string;
  artie_mode: 'calm' | 'hype' | 'nerdy';
  reminder_enabled: number;
  reminder_time: string;
  is_subscribed: number;
  has_completed_onboarding: number;
  created_at: string;
}

export interface Compound {
  id: number;
  name: string;
  dose_mcg: number | null;
  frequency: string;
  start_date: string | null;
  active: number;
  vial_size_mg: number | null;
  bac_water_ml: number | null;
  half_life_hours: number | null;
  notes: string;
  created_at: string;
}

export interface InjectionLog {
  id: number;
  compound_id: number;
  logged_at: string;
  dose_mcg: number;
  site: string;
  is_late_log: number;
  notes: string;
}

export interface Bookmark {
  id: number;
  article_slug: string;
  bookmarked_at: string;
}

export interface SavedConcentration {
  id: number;
  compound_id: number | null;
  vial_mg: number;
  bac_water_ml: number;
  dose_mcg: number | null;
  saved_at: string;
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: 'safety' | 'protocols' | 'nutrition' | 'recovery' | 'q&a';
  readTimeMinutes: number;
  featured: boolean;
  body: string;
}

export interface PeptideInfo {
  name: string;
  aliases: string[];
  typical_dose_mcg: number;
  half_life_hours: number;
  frequency_options: string[];
  category: string;
  common_protocols: string[];
}

export type ArtieMode = 'calm' | 'hype' | 'nerdy';

export type GoalOption =
  | 'Recovery & Healing'
  | 'Body Composition'
  | 'Longevity'
  | 'Sleep & Recovery'
  | 'Cognitive Performance'
  | 'Just Exploring';

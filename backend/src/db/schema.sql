-- ============================================================
-- SCHEMA — English Academy Platform
-- Compatible SQLite local ET Turso (libSQL)
-- ============================================================

-- Un seul compte peut avoir un seul role. Le "super admin" est
-- role='superadmin' ET apparait aussi dans teacher_profiles
-- (il herite des droits d'un professeur sur SES propres eleves).
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('student','teacher','admin','superadmin')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Profil professeur (superadmin en a un aussi)
CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  subject TEXT NOT NULL DEFAULT 'English'
);

-- Droits accordes par le super admin a un compte 'admin'.
-- Le super admin lui-meme n'a pas besoin de ligne ici : il a tout.
CREATE TABLE IF NOT EXISTS admin_permissions (
  user_id                TEXT PRIMARY KEY REFERENCES users(id),
  can_manage_teachers    INTEGER NOT NULL DEFAULT 0,
  can_manage_students    INTEGER NOT NULL DEFAULT 1,
  can_manage_courses     INTEGER NOT NULL DEFAULT 0,
  can_manage_appearance  INTEGER NOT NULL DEFAULT 0,
  can_manage_media       INTEGER NOT NULL DEFAULT 1,
  can_manage_admins      INTEGER NOT NULL DEFAULT 0  -- reserve au super admin normalement
);

-- Profil eleve
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id      TEXT PRIMARY KEY REFERENCES users(id),
  teacher_id   TEXT REFERENCES users(id),        -- NULL = non assigne
  course_name  TEXT DEFAULT 'English B1',
  current_month INTEGER NOT NULL DEFAULT 1,
  current_week  INTEGER NOT NULL DEFAULT 1,
  streak_days   INTEGER NOT NULL DEFAULT 0,
  overall_pct   INTEGER NOT NULL DEFAULT 0,
  subscription_status   TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial','active','expired')),
  trial_ends_at          TEXT,
  subscription_expires_at TEXT
);

-- Score obtenu par un eleve sur les exercices d'une semaine (dernier essai
-- fait foi). Sert de condition pour debloquer la semaine suivante.
CREATE TABLE IF NOT EXISTS exercise_scores (
  id           TEXT PRIMARY KEY,
  student_id   TEXT NOT NULL REFERENCES users(id),
  week_number  INTEGER NOT NULL,
  score_pct    INTEGER NOT NULL,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(student_id, week_number)
);

-- Paiements d'abonnement (CamPay : push Mobile Money direct MTN/Orange).
CREATE TABLE IF NOT EXISTS payments (
  id               TEXT PRIMARY KEY,
  student_id       TEXT NOT NULL REFERENCES users(id),
  transaction_id   TEXT NOT NULL UNIQUE,   -- notre reference interne (external_reference envoyee a CamPay)
  campay_reference TEXT,                    -- reference renvoyee par CamPay, utilisee pour vérifier le statut
  amount           INTEGER NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'XAF',
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  payment_method   TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at     TEXT
);

-- Programme : 9 mois
CREATE TABLE IF NOT EXISTS months (
  id        INTEGER PRIMARY KEY,
  number    INTEGER NOT NULL UNIQUE,
  title     TEXT NOT NULL,
  objective TEXT
);

-- Programme : 36 semaines rattachees a un mois
CREATE TABLE IF NOT EXISTS weeks (
  id             INTEGER PRIMARY KEY,
  month_id       INTEGER NOT NULL REFERENCES months(id),
  number         INTEGER NOT NULL UNIQUE,   -- 1..36
  title          TEXT NOT NULL,
  grammar_title  TEXT,
  grammar_html   TEXT,                      -- contenu du cours de grammaire (HTML simple)
  speaking_task  TEXT,
  is_test_week   INTEGER NOT NULL DEFAULT 0
);

-- Vocabulaire par semaine
CREATE TABLE IF NOT EXISTS vocabulary_words (
  id         TEXT PRIMARY KEY,
  week_id    INTEGER NOT NULL REFERENCES weeks(id),
  word       TEXT NOT NULL,
  word_type  TEXT,                 -- noun / verb / adjective...
  fr         TEXT,
  gb_variant TEXT,                 -- ex: "flat" (vide si pas de variante)
  us_variant TEXT,                 -- ex: "apartment"
  audio_url  TEXT                  -- prononciation, uploadee par prof/admin
);

-- Exercices (QCM simple) par semaine
CREATE TABLE IF NOT EXISTS exercises (
  id             TEXT PRIMARY KEY,
  week_id        INTEGER NOT NULL REFERENCES weeks(id),
  question       TEXT NOT NULL,
  options_json   TEXT NOT NULL,     -- '["should go","should went","went","should to go"]'
  correct_index  INTEGER NOT NULL
);

-- Compositions (une toutes les 2 semaines)
CREATE TABLE IF NOT EXISTS compositions (
  id          INTEGER PRIMARY KEY,
  number      INTEGER NOT NULL UNIQUE,
  week_id     INTEGER REFERENCES weeks(id),
  title       TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  min_words   INTEGER NOT NULL DEFAULT 100
);

-- Copies rendues par les eleves
CREATE TABLE IF NOT EXISTS composition_submissions (
  id             TEXT PRIMARY KEY,
  composition_id INTEGER NOT NULL REFERENCES compositions(id),
  student_id     TEXT NOT NULL REFERENCES users(id),
  body           TEXT NOT NULL DEFAULT '',
  word_count     INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','corrected')),
  score          INTEGER,
  teacher_feedback TEXT,
  submitted_at   TEXT,
  corrected_at   TEXT,
  corrected_by   TEXT REFERENCES users(id)
);

-- Scenarios du Speaking Lab (pilotes par IA)
CREATE TABLE IF NOT EXISTS speaking_scenarios (
  id         INTEGER PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  emoji      TEXT DEFAULT '🗣️',
  level      TEXT NOT NULL DEFAULT 'Beginner',
  ai_persona TEXT NOT NULL,     -- ex: "Dr. Johnson, a friendly doctor"
  ai_opening TEXT NOT NULL,     -- premiere ligne de l'IA
  goal       TEXT NOT NULL,     -- objectif pedagogique donne a l'IA
  audio_url  TEXT                -- optionnel : audio d'exemple uploade par prof/admin
);

-- Historique des sessions de speaking (pour progression + relecture prof)
CREATE TABLE IF NOT EXISTS speaking_sessions (
  id           TEXT PRIMARY KEY,
  student_id   TEXT NOT NULL REFERENCES users(id),
  scenario_id  INTEGER NOT NULL REFERENCES speaking_scenarios(id),
  transcript_json TEXT NOT NULL,     -- [{from:'ai'|'user', text:'...'}]
  scores_json  TEXT,                 -- {pronunciation, fluency, grammar, vocabulary, overall}
  ai_feedback  TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Ressources audio uploadees (listening lab, prononciation vocabulaire, etc.)
CREATE TABLE IF NOT EXISTS audio_resources (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('listening','vocabulary','speaking_example')),
  week_id     INTEGER REFERENCES weeks(id),
  url         TEXT NOT NULL,
  transcript  TEXT,
  uploaded_by TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reglages d'apparence (un seul enregistrement, id=1)
CREATE TABLE IF NOT EXISTS appearance_settings (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  platform_name  TEXT NOT NULL DEFAULT 'English Academy',
  tagline        TEXT NOT NULL DEFAULT 'Learn English with confidence.',
  logo_glyph     TEXT NOT NULL DEFAULT 'E',
  theme_primary  TEXT NOT NULL DEFAULT '#0F2544',
  theme_accent   TEXT NOT NULL DEFAULT '#E8834A',
  nav_items_json TEXT NOT NULL DEFAULT '[{"key":"dashboard","label":"Dashboard","icon":"grid"},{"key":"journey","label":"My Journey","icon":"compass"},{"key":"lesson","label":"Current Lesson","icon":"book"},{"key":"speaking","label":"Speaking Lab","icon":"mic"},{"key":"vocabulary","label":"Vocabulary","icon":"bookmark"},{"key":"compositions","label":"Compositions","icon":"file"},{"key":"progress","label":"My Progress","icon":"chart"}]'
);

CREATE INDEX IF NOT EXISTS idx_weeks_month ON weeks(month_id);
CREATE INDEX IF NOT EXISTS idx_vocab_week ON vocabulary_words(week_id);
CREATE INDEX IF NOT EXISTS idx_exercises_week ON exercises(week_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher ON student_profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON composition_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_speaking_student ON speaking_sessions(student_id);

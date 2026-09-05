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
  subscription_expires_at TEXT,
  last_active_at          TEXT   -- utilise par le streak et la relance automatique (cron inactifs)
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

-- Paiements d'abonnement (NotchPay : Mobile Money + Visa/Mastercard en une
-- seule integration, via redirection vers page hebergee).
CREATE TABLE IF NOT EXISTS payments (
  id                 TEXT PRIMARY KEY,
  student_id         TEXT NOT NULL REFERENCES users(id),
  transaction_id     TEXT NOT NULL UNIQUE,   -- notre reference interne
  provider_reference TEXT,                    -- reference NotchPay, utilisee pour verifier le statut
  amount             INTEGER NOT NULL,
  currency           TEXT NOT NULL DEFAULT 'XAF',
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  payment_method     TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at       TEXT
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
  audio_url  TEXT,               -- optionnel : audio d'exemple uploade par prof/admin
  week_number INTEGER            -- semaine a laquelle ce scenario est rattache (deblocage progression)
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
  show_leaderboard INTEGER NOT NULL DEFAULT 1,
  nav_items_json TEXT NOT NULL DEFAULT '[{"key":"dashboard","label":"Dashboard","icon":"grid"},{"key":"journey","label":"My Journey","icon":"compass"},{"key":"lesson","label":"Current Lesson","icon":"book"},{"key":"speaking","label":"Speaking Lab","icon":"mic"},{"key":"vocabulary","label":"Vocabulary","icon":"bookmark"},{"key":"compositions","label":"Compositions","icon":"file"},{"key":"progress","label":"My Progress","icon":"chart"}]'
);

CREATE INDEX IF NOT EXISTS idx_weeks_month ON weeks(month_id);
CREATE INDEX IF NOT EXISTS idx_vocab_week ON vocabulary_words(week_id);
CREATE INDEX IF NOT EXISTS idx_exercises_week ON exercises(week_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher ON student_profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON composition_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_speaking_student ON speaking_sessions(student_id);

-- ============================================================
-- NOTIFICATIONS PUSH & ENGAGEMENT (double sens : eleve -> admin,
-- admin/systeme -> eleve)
-- ============================================================

-- Abonnement push d'un navigateur/appareil (Web Push API standard).
-- Une ligne par (utilisateur, appareil) — un meme compte peut avoir
-- plusieurs appareils abonnes.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  role         TEXT NOT NULL,
  endpoint     TEXT NOT NULL UNIQUE,
  subscription_json TEXT NOT NULL,   -- {endpoint, keys:{p256dh,auth}} complet
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Journal des actions eleve qui declenchent une notification a l'admin
-- (ex: "a commence le cours", "a echoue un exercice"...).
CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  type        TEXT NOT NULL,   -- 'COURS_COMMENCE' | 'COURS_TERMINE' | 'EXERCICE_ECHOUE' | ...
  week_number INTEGER,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Historique des notifications envoyees (audit + eviter les doublons)
CREATE TABLE IF NOT EXISTS notifications_log (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  sent_by    TEXT,             -- 'system' (cron) ou l'id de l'admin/prof qui a envoye manuellement
  sent_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_user ON notifications_log(user_id);

-- ============================================================
-- IMAGES, VIDEOS, QUIZ QUOTIDIEN
-- ============================================================

-- Bibliotheque d'images de vocabulaire (mot anglais + traduction + image).
-- Le nombre affiche a l'eleve augmente au fur et a mesure qu'il avance
-- dans le programme (voir logique cote controller).
CREATE TABLE IF NOT EXISTS media_images (
  id            TEXT PRIMARY KEY,
  word          TEXT NOT NULL,
  translation_fr TEXT NOT NULL,
  image_url     TEXT NOT NULL,
  week_number   INTEGER,           -- semaine minimale pour debloquer cette image (ordre de deblocage)
  uploaded_by   TEXT REFERENCES users(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bibliotheque de videos (URL externe ou uploadee).
CREATE TABLE IF NOT EXISTS media_videos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'lesson',
  week_number INTEGER,
  uploaded_by TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Historique des quiz quotidiens (20 questions, difficulte croissante).
CREATE TABLE IF NOT EXISTS daily_quiz_attempts (
  id              TEXT PRIMARY KEY,
  student_id      TEXT NOT NULL REFERENCES users(id),
  quiz_date       TEXT NOT NULL,   -- 'YYYY-MM-DD', un quiz credite max par jour
  score_pct       INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(student_id, quiz_date)
);

CREATE INDEX IF NOT EXISTS idx_media_images_week ON media_images(week_number);
CREATE INDEX IF NOT EXISTS idx_media_videos_week ON media_videos(week_number);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_student ON daily_quiz_attempts(student_id);

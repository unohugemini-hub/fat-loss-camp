-- 减肥夏令营 数据库
DROP TABLE IF EXISTS records;
CREATE TABLE records (
  date TEXT PRIMARY KEY,
  weight REAL,
  note TEXT,
  total_calories INTEGER DEFAULT 0,
  meals TEXT DEFAULT '{}',
  workouts TEXT DEFAULT '[]',
  cardio_count INTEGER DEFAULT 0,
  strength_count INTEGER DEFAULT 0,
  has_junk_snack INTEGER DEFAULT 0,
  prev_weight REAL,
  coach_review TEXT,
  coach_review_type TEXT,
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

DROP TABLE IF EXISTS coach_history;
CREATE TABLE coach_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  msg TEXT NOT NULL,
  type TEXT DEFAULT 'neutral',
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

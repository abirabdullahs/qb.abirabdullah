-- ============================================================
-- ONLINE SMART QUESTION BANK — DATABASE SCHEMA (v2)
-- Target: PostgreSQL 14+
-- Changes from v1:
--   (4) Guccho/Cluster admission support (unit-based, multi-institute)
--   (5) Centralized exam support (e.g. Medical — one national exam)
--   (9) LaTeX / math-mixed Bangla text support
-- IMPORTANT: create the database with UTF8 so Bangla + LaTeX symbols
--   store correctly, e.g.:
--   CREATE DATABASE question_bank WITH ENCODING 'UTF8' TEMPLATE template0;
-- ============================================================


-- ============================================================
-- 1. LOOKUP / MASTER TABLES
-- ============================================================

CREATE TABLE segments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,      -- SSC, HSC, Dakhil, Alim, Admission
    code            VARCHAR(20) NOT NULL UNIQUE,
    segment_kind    VARCHAR(20) NOT NULL CHECK (segment_kind IN ('academic', 'admission')),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- বিজ্ঞান / মানবিক / ব্যবসায় শিক্ষা — only relevant for SSC/HSC
CREATE TABLE groups (
    id              SERIAL PRIMARY KEY,
    segment_id      INTEGER NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20),
    UNIQUE (segment_id, name)
);

CREATE TABLE boards (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    code            VARCHAR(20) UNIQUE
);

CREATE TABLE admission_segments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,       -- Engineering, Medical, Varsity, IBA...
    code            VARCHAR(20) UNIQUE
);

-- Institutes (universities/colleges) — still needed as a reference list,
-- even though a question is no longer directly tagged to one institute
-- when it's part of a cluster/centralized exam.
CREATE TABLE institutes (
    id                    SERIAL PRIMARY KEY,
    admission_segment_id  INTEGER NOT NULL REFERENCES admission_segments(id) ON DELETE CASCADE,
    name                  VARCHAR(150) NOT NULL,
    short_name            VARCHAR(50),
    location              VARCHAR(100),
    UNIQUE (admission_segment_id, name)
);

CREATE TABLE subjects (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20),
    UNIQUE (name)
);

CREATE TABLE subject_groups (
    subject_id      INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    group_id        INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (subject_id, group_id)
);

CREATE TABLE chapters (
    id              SERIAL PRIMARY KEY,
    subject_id      INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    order_no        INTEGER DEFAULT 0,
    UNIQUE (subject_id, name)
);

CREATE TABLE topics (
    id              SERIAL PRIMARY KEY,
    chapter_id      INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    order_no        INTEGER DEFAULT 0,
    UNIQUE (chapter_id, name)
);

CREATE TABLE sub_topics (
    id              SERIAL PRIMARY KEY,
    topic_id        INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    order_no        INTEGER DEFAULT 0,
    UNIQUE (topic_id, name)
);

CREATE TABLE tags (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    role            VARCHAR(20) NOT NULL DEFAULT 'contributor'
                    CHECK (role IN ('admin', 'moderator', 'teacher', 'contributor')),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. ADMISSION EXAM MODEL  (point 4 + 5)
-- ============================================================

-- One row per real-world exam event.
-- exam_type tells you how institutes relate to it:
--   'single_institute' -> e.g. BUET, DU (own separate question set) -> use institute_id directly
--   'cluster'          -> e.g. GST Guccho -> one exam, multiple UNITS (A/B/C), each unit accepted
--                         by many institutes -> use admission_units + admission_unit_institutes
--   'centralized'      -> e.g. Medical Admission (DGHS) -> ONE nationwide exam/question set,
--                         institute choice happens later at allocation stage, not per-question
CREATE TABLE admission_exams (
    id                    SERIAL PRIMARY KEY,
    admission_segment_id  INTEGER NOT NULL REFERENCES admission_segments(id),
    name                  VARCHAR(150) NOT NULL,          -- "GST Guccho 2023", "Medical Admission 2023", "BUET 2023"
    exam_year             SMALLINT NOT NULL,
    conducting_body       VARCHAR(100),                    -- "GST", "DGHS", "BUET", "DU"
    exam_type             VARCHAR(20) NOT NULL CHECK (exam_type IN ('single_institute', 'cluster', 'centralized')),
    -- for single_institute exams only: which institute owns this exam
    institute_id          INTEGER REFERENCES institutes(id),
    negative_marking      NUMERIC(4,2) DEFAULT 0,          -- e.g. 0.25
    created_at            TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_single_institute_has_institute CHECK (
        (exam_type = 'single_institute' AND institute_id IS NOT NULL)
        OR (exam_type <> 'single_institute')
    ),
    UNIQUE (admission_segment_id, name, exam_year)
);

-- Units within a cluster exam (A unit / B unit / C unit ...), each with its own subject combination.
-- Only populated when the parent exam's exam_type = 'cluster'.
CREATE TABLE admission_units (
    id                  SERIAL PRIMARY KEY,
    admission_exam_id   INTEGER NOT NULL REFERENCES admission_exams(id) ON DELETE CASCADE,
    unit_name           VARCHAR(20) NOT NULL,     -- A, B, C, D...
    description         VARCHAR(255),             -- e.g. "Science-background unit"
    UNIQUE (admission_exam_id, unit_name)
);

-- Which institutes accept a given cluster unit's score (many-to-many).
CREATE TABLE admission_unit_institutes (
    unit_id         INTEGER NOT NULL REFERENCES admission_units(id) ON DELETE CASCADE,
    institute_id    INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    PRIMARY KEY (unit_id, institute_id)
);


-- ============================================================
-- 3. QUESTIONS (core table)
-- ============================================================

CREATE TABLE questions (
    id                    BIGSERIAL PRIMARY KEY,

    segment_id            INTEGER NOT NULL REFERENCES segments(id),
    group_id              INTEGER REFERENCES groups(id),               -- academic only

    admission_segment_id  INTEGER REFERENCES admission_segments(id),   -- admission only (Engineering/Medical/Varsity)
    admission_exam_id     INTEGER REFERENCES admission_exams(id),      -- which exam this question is from
    admission_unit_id     INTEGER REFERENCES admission_units(id),      -- only set for 'cluster' exam_type
    institute_id          INTEGER REFERENCES institutes(id),           -- only set for 'single_institute' exam_type

    subject_id            INTEGER NOT NULL REFERENCES subjects(id),
    chapter_id            INTEGER REFERENCES chapters(id),
    topic_id              INTEGER REFERENCES topics(id),
    sub_topic_id          INTEGER REFERENCES sub_topics(id),

    question_type         VARCHAR(10) NOT NULL CHECK (question_type IN ('MCQ', 'CQ', 'WRITTEN')),

    stimulus_text         TEXT,          -- উদ্দীপক
    question_text         TEXT NOT NULL,

    -- (point 9) LaTeX / math support: text fields store Bangla + inline LaTeX
    -- using $...$ (inline) or $$...$$ (block) delimiters, e.g.
    -- "একটি বস্তুর ভর $m = 5\\,kg$ এবং ত্বরণ $a = 2\\,m/s^2$।"
    -- has_math flags whether the frontend should load a math renderer (KaTeX/MathJax)
    -- for this question, so plain-text questions skip that cost.
    has_math               BOOLEAN NOT NULL DEFAULT false,

    cq_style               VARCHAR(20) CHECK (cq_style IN ('গ_ঘ_separate', 'গ_ঘ_combined')),

    year                    SMALLINT,
    exam_name                VARCHAR(150),
    is_previous_year         BOOLEAN NOT NULL DEFAULT false,

    marks                    NUMERIC(5,2),
    difficulty                VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    language                   VARCHAR(5) NOT NULL DEFAULT 'bn' CHECK (language IN ('bn', 'en')),

    answer_text                TEXT,             -- nullable
    explanation_text           TEXT,             -- nullable
    video_solution_url          VARCHAR(255),

    status                       VARCHAR(15) NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected')),
    contributor_id               INTEGER REFERENCES users(id),
    reviewed_by                  INTEGER REFERENCES users(id),

    duplicate_hash                VARCHAR(64),

    created_at                     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at                     TIMESTAMP NOT NULL DEFAULT now(),

    -- exactly one of (academic / admission) branch must be filled
    CONSTRAINT chk_academic_or_admission CHECK (
        (group_id IS NOT NULL AND admission_segment_id IS NULL AND admission_exam_id IS NULL)
        OR
        (group_id IS NULL AND admission_segment_id IS NOT NULL)
    ),

    -- if this question belongs to an admission exam, the institute/unit
    -- tagging must match that exam's type
    CONSTRAINT chk_admission_linkage CHECK (
        admission_exam_id IS NULL
        OR (institute_id IS NULL AND admission_unit_id IS NULL)   -- centralized: neither set
        OR (institute_id IS NOT NULL AND admission_unit_id IS NULL) -- single_institute
        OR (institute_id IS NULL AND admission_unit_id IS NOT NULL) -- cluster
    )
);

CREATE INDEX idx_questions_subject        ON questions(subject_id);
CREATE INDEX idx_questions_chapter        ON questions(chapter_id);
CREATE INDEX idx_questions_topic          ON questions(topic_id);
CREATE INDEX idx_questions_segment        ON questions(segment_id);
CREATE INDEX idx_questions_type           ON questions(question_type);
CREATE INDEX idx_questions_status         ON questions(status);
CREATE INDEX idx_questions_duphash        ON questions(duplicate_hash);
CREATE INDEX idx_questions_admission_exam ON questions(admission_exam_id);
CREATE INDEX idx_questions_admission_unit ON questions(admission_unit_id);
CREATE INDEX idx_questions_institute      ON questions(institute_id);
CREATE INDEX idx_questions_seg_subj_chap  ON questions(segment_id, subject_id, chapter_id);


-- ============================================================
-- 4. MCQ OPTIONS
-- ============================================================

CREATE TABLE question_options (
    id                SERIAL PRIMARY KEY,
    question_id       BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_label      CHAR(1) NOT NULL CHECK (option_label IN ('A','B','C','D','E')),
    option_text       TEXT NOT NULL,
    is_correct        BOOLEAN NOT NULL DEFAULT false,
    explanation_text  TEXT,
    order_no          INTEGER DEFAULT 0,
    UNIQUE (question_id, option_label)
);

CREATE INDEX idx_options_question ON question_options(question_id);


-- ============================================================
-- 5. CQ SUB-PARTS (ক, খ, গ, ঘ)
-- ============================================================

CREATE TABLE question_sub_parts (
    id                 SERIAL PRIMARY KEY,
    question_id        BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    part_label         VARCHAR(5) NOT NULL CHECK (part_label IN ('ক','খ','গ','ঘ')),
    part_text          TEXT NOT NULL,
    marks              NUMERIC(4,2),
    cognitive_level    VARCHAR(20) CHECK (cognitive_level IN ('জ্ঞানমূলক','অনুধাবনমূলক','প্রয়োগমূলক','উচ্চতর_দক্ষতা')),
    answer_text        TEXT,
    explanation_text   TEXT,
    order_no           INTEGER DEFAULT 0,
    UNIQUE (question_id, part_label)
);

CREATE INDEX idx_subparts_question ON question_sub_parts(question_id);


-- ============================================================
-- 6. BOARD MAPPING
-- ============================================================

CREATE TABLE question_boards (
    id              SERIAL PRIMARY KEY,
    question_id     BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    board_id        INTEGER NOT NULL REFERENCES boards(id),
    year            SMALLINT,
    UNIQUE (question_id, board_id, year)
);


-- ============================================================
-- 7. ATTACHMENTS (images anywhere — polymorphic)
-- ============================================================

CREATE TABLE attachments (
    id                SERIAL PRIMARY KEY,
    attachable_type   VARCHAR(30) NOT NULL CHECK (
                        attachable_type IN (
                            'question_stimulus', 'question_body', 'question_option',
                            'question_sub_part', 'question_explanation', 'question_answer'
                        )
                      ),
    attachable_id     BIGINT NOT NULL,
    image_url         VARCHAR(500) NOT NULL,
    alt_text          VARCHAR(255),
    order_no          INTEGER DEFAULT 0,
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_polymorphic ON attachments(attachable_type, attachable_id);


-- ============================================================
-- 8. TAGS (many-to-many)
-- ============================================================

CREATE TABLE question_tags (
    question_id     BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag_id          INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);


-- ============================================================
-- 9. USAGE STATS
-- ============================================================

CREATE TABLE question_stats (
    question_id       BIGINT PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
    attempt_count     BIGINT NOT NULL DEFAULT 0,
    correct_count     BIGINT NOT NULL DEFAULT 0,
    avg_time_seconds  NUMERIC(8,2),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);


-- ============================================================
-- 10. QUESTION SETS / MOCK TESTS
-- ============================================================

CREATE TABLE question_sets (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    segment_id      INTEGER REFERENCES segments(id),
    negative_marking NUMERIC(4,2) DEFAULT 0,
    created_by      INTEGER REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE question_set_items (
    set_id          INTEGER NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
    question_id     BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_no        INTEGER DEFAULT 0,
    marks_override  NUMERIC(5,2),
    PRIMARY KEY (set_id, question_id)
);


-- ============================================================
-- 11. TRIGGER: auto-update `updated_at`
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- SAMPLE SEED
-- ============================================================

INSERT INTO segments (name, code, segment_kind) VALUES
('SSC', 'SSC', 'academic'),
('HSC', 'HSC', 'academic'),
('Admission', 'ADM', 'admission');

INSERT INTO admission_segments (name, code) VALUES
('Engineering', 'ENG'),
('Medical', 'MED'),
('Varsity', 'VAR');

INSERT INTO boards (name, code) VALUES
('ঢাকা', 'DHK'), ('রাজশাহী', 'RAJ'), ('কুমিল্লা', 'CUM'),
('যশোর', 'JES'), ('চট্টগ্রাম', 'CHT'), ('বরিশাল', 'BAR'),
('সিলেট', 'SYL'), ('দিনাজপুর', 'DIN'), ('ময়মনসিংহ', 'MYM'),
('মাদ্রাসা', 'MAD'), ('কারিগরি', 'TEC');

-- Example: Medical — one centralized nationwide exam (point 5)
INSERT INTO admission_exams (admission_segment_id, name, exam_year, conducting_body, exam_type, negative_marking)
VALUES (
    (SELECT id FROM admission_segments WHERE code = 'MED'),
    'MBBS Admission Test 2026', 2026, 'DGHS', 'centralized', 0.25
);
-- Questions for this exam: admission_exam_id set, institute_id and admission_unit_id left NULL.
-- Which colleges a student can be allocated to is a separate concern outside the question bank.

-- Example: GST Guccho — cluster exam with units (point 4)
INSERT INTO admission_exams (admission_segment_id, name, exam_year, conducting_body, exam_type)
VALUES (
    (SELECT id FROM admission_segments WHERE code = 'VAR'),
    'GST Guccho Admission 2026', 2026, 'GST', 'cluster'
);
INSERT INTO admission_units (admission_exam_id, unit_name, description)
VALUES (
    (SELECT id FROM admission_exams WHERE name = 'GST Guccho Admission 2026'),
    'A', 'বিজ্ঞান ইউনিট'
);
-- Then link participating institutes to this unit via admission_unit_institutes.

-- Example: BUET — single-institute exam (point 4, contrast case)
INSERT INTO institutes (admission_segment_id, name, short_name)
VALUES ((SELECT id FROM admission_segments WHERE code = 'ENG'), 'Bangladesh University of Engineering and Technology', 'BUET');

INSERT INTO admission_exams (admission_segment_id, name, exam_year, conducting_body, exam_type, institute_id)
VALUES (
    (SELECT id FROM admission_segments WHERE code = 'ENG'),
    'BUET Admission 2026', 2026, 'BUET', 'single_institute',
    (SELECT id FROM institutes WHERE short_name = 'BUET')
);

import {
  pgTable,
  serial,
  bigserial,
  integer,
  bigint,
  varchar,
  text,
  boolean,
  smallint,
  numeric,
  timestamp,
  primaryKey,
  char,
} from "drizzle-orm/pg-core";

// ─── Segments ────────────────────────────────────────────────────────────────
export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  segmentKind: varchar("segment_kind", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = typeof segments.$inferInsert;

// ─── Groups ───────────────────────────────────────────────────────────────────
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  segmentId: integer("segment_id")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

// ─── Boards ───────────────────────────────────────────────────────────────────
export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 20 }).unique(),
});

export type Board = typeof boards.$inferSelect;
export type InsertBoard = typeof boards.$inferInsert;

// ─── Admission Segments ───────────────────────────────────────────────────────
export const admissionSegments = pgTable("admission_segments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  code: varchar("code", { length: 20 }).unique(),
});

export type AdmissionSegment = typeof admissionSegments.$inferSelect;
export type InsertAdmissionSegment = typeof admissionSegments.$inferInsert;

// ─── Institutes ───────────────────────────────────────────────────────────────
export const institutes = pgTable("institutes", {
  id: serial("id").primaryKey(),
  admissionSegmentId: integer("admission_segment_id")
    .notNull()
    .references(() => admissionSegments.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 150 }).notNull(),
  shortName: varchar("short_name", { length: 50 }),
  location: varchar("location", { length: 100 }),
});

export type Institute = typeof institutes.$inferSelect;
export type InsertInstitute = typeof institutes.$inferInsert;

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 20 }),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

// ─── Subject Groups ───────────────────────────────────────────────────────────
export const subjectGroups = pgTable(
  "subject_groups",
  {
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.subjectId, t.groupId] })],
);

// ─── Chapters ─────────────────────────────────────────────────────────────────
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  orderNo: integer("order_no").default(0),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

// ─── Topics ───────────────────────────────────────────────────────────────────
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  orderNo: integer("order_no").default(0),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;

// ─── Sub Topics ───────────────────────────────────────────────────────────────
export const subTopics = pgTable("sub_topics", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  orderNo: integer("order_no").default(0),
});

export type SubTopic = typeof subTopics.$inferSelect;

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull().unique(),
});

export type Tag = typeof tags.$inferSelect;

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique(),
  role: varchar("role", { length: 20 }).notNull().default("contributor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Admission Exams ──────────────────────────────────────────────────────────
export const admissionExams = pgTable("admission_exams", {
  id: serial("id").primaryKey(),
  admissionSegmentId: integer("admission_segment_id")
    .notNull()
    .references(() => admissionSegments.id),
  name: varchar("name", { length: 150 }).notNull(),
  examYear: smallint("exam_year").notNull(),
  conductingBody: varchar("conducting_body", { length: 100 }),
  examType: varchar("exam_type", { length: 20 }).notNull(),
  instituteId: integer("institute_id").references(() => institutes.id),
  negativeMarking: numeric("negative_marking", { precision: 4, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AdmissionExam = typeof admissionExams.$inferSelect;
export type InsertAdmissionExam = typeof admissionExams.$inferInsert;

// ─── Admission Units ──────────────────────────────────────────────────────────
export const admissionUnits = pgTable("admission_units", {
  id: serial("id").primaryKey(),
  admissionExamId: integer("admission_exam_id")
    .notNull()
    .references(() => admissionExams.id, { onDelete: "cascade" }),
  unitName: varchar("unit_name", { length: 20 }).notNull(),
  description: varchar("description", { length: 255 }),
});

export type AdmissionUnit = typeof admissionUnits.$inferSelect;
export type InsertAdmissionUnit = typeof admissionUnits.$inferInsert;

// ─── Admission Unit Institutes ────────────────────────────────────────────────
export const admissionUnitInstitutes = pgTable(
  "admission_unit_institutes",
  {
    unitId: integer("unit_id")
      .notNull()
      .references(() => admissionUnits.id, { onDelete: "cascade" }),
    instituteId: integer("institute_id")
      .notNull()
      .references(() => institutes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.unitId, t.instituteId] })],
);

// ─── Questions ────────────────────────────────────────────────────────────────
export const questions = pgTable("questions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  segmentId: integer("segment_id")
    .notNull()
    .references(() => segments.id),
  groupId: integer("group_id").references(() => groups.id),
  admissionSegmentId: integer("admission_segment_id").references(
    () => admissionSegments.id,
  ),
  admissionExamId: integer("admission_exam_id").references(
    () => admissionExams.id,
  ),
  admissionUnitId: integer("admission_unit_id").references(
    () => admissionUnits.id,
  ),
  instituteId: integer("institute_id").references(() => institutes.id),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  chapterId: integer("chapter_id").references(() => chapters.id),
  topicId: integer("topic_id").references(() => topics.id),
  subTopicId: integer("sub_topic_id").references(() => subTopics.id),
  questionType: varchar("question_type", { length: 10 }).notNull(),
  stimulusText: text("stimulus_text"),
  questionText: text("question_text").notNull(),
  hasMath: boolean("has_math").notNull().default(false),
  cqStyle: varchar("cq_style", { length: 20 }),
  year: smallint("year"),
  examName: varchar("exam_name", { length: 150 }),
  isPreviousYear: boolean("is_previous_year").notNull().default(false),
  marks: numeric("marks", { precision: 5, scale: 2 }),
  difficulty: varchar("difficulty", { length: 10 }).default("medium"),
  language: varchar("language", { length: 5 }).notNull().default("bn"),
  answerText: text("answer_text"),
  explanationText: text("explanation_text"),
  videoSolutionUrl: varchar("video_solution_url", { length: 255 }),
  status: varchar("status", { length: 15 }).notNull().default("pending"),
  contributorId: integer("contributor_id").references(() => users.id),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  duplicateHash: varchar("duplicate_hash", { length: 64 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// ─── Question Options ─────────────────────────────────────────────────────────
export const questionOptions = pgTable("question_options", {
  id: serial("id").primaryKey(),
  questionId: bigint("question_id", { mode: "number" })
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  optionLabel: char("option_label", { length: 1 }).notNull(),
  optionText: text("option_text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  explanationText: text("explanation_text"),
  orderNo: integer("order_no").default(0),
});

export type QuestionOption = typeof questionOptions.$inferSelect;
export type InsertQuestionOption = typeof questionOptions.$inferInsert;

// ─── Question Sub Parts ───────────────────────────────────────────────────────
export const questionSubParts = pgTable("question_sub_parts", {
  id: serial("id").primaryKey(),
  questionId: bigint("question_id", { mode: "number" })
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  partLabel: varchar("part_label", { length: 5 }).notNull(),
  partText: text("part_text").notNull(),
  marks: numeric("marks", { precision: 4, scale: 2 }),
  cognitiveLevel: varchar("cognitive_level", { length: 20 }),
  answerText: text("answer_text"),
  explanationText: text("explanation_text"),
  orderNo: integer("order_no").default(0),
});

export type QuestionSubPart = typeof questionSubParts.$inferSelect;
export type InsertQuestionSubPart = typeof questionSubParts.$inferInsert;

// ─── Question Boards ──────────────────────────────────────────────────────────
export const questionBoards = pgTable("question_boards", {
  id: serial("id").primaryKey(),
  questionId: bigint("question_id", { mode: "number" })
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  boardId: integer("board_id")
    .notNull()
    .references(() => boards.id),
  year: smallint("year"),
});

// ─── Attachments ──────────────────────────────────────────────────────────────
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  attachableType: varchar("attachable_type", { length: 30 }).notNull(),
  attachableId: bigint("attachable_id", { mode: "number" }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  orderNo: integer("order_no").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Tags Many-to-Many ────────────────────────────────────────────────────────
export const questionTags = pgTable(
  "question_tags",
  {
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.tagId] })],
);

// ─── Question Stats ───────────────────────────────────────────────────────────
export const questionStats = pgTable("question_stats", {
  questionId: bigint("question_id", { mode: "number" })
    .primaryKey()
    .references(() => questions.id, { onDelete: "cascade" }),
  attemptCount: bigint("attempt_count", { mode: "number" }).notNull().default(0),
  correctCount: bigint("correct_count", { mode: "number" }).notNull().default(0),
  avgTimeSeconds: numeric("avg_time_seconds", { precision: 8, scale: 2 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Question Sets ────────────────────────────────────────────────────────────
export const questionSets = pgTable("question_sets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  segmentId: integer("segment_id").references(() => segments.id),
  negativeMarking: numeric("negative_marking", { precision: 4, scale: 2 }).default("0"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type QuestionSet = typeof questionSets.$inferSelect;
export type InsertQuestionSet = typeof questionSets.$inferInsert;

// ─── Question Set Items ───────────────────────────────────────────────────────
export const questionSetItems = pgTable(
  "question_set_items",
  {
    setId: integer("set_id")
      .notNull()
      .references(() => questionSets.id, { onDelete: "cascade" }),
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    orderNo: integer("order_no").default(0),
    marksOverride: numeric("marks_override", { precision: 5, scale: 2 }),
  },
  (t) => [primaryKey({ columns: [t.setId, t.questionId] })],
);

export type QuestionSetItem = typeof questionSetItems.$inferSelect;

import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, questions, questionSets, subjects, segments } from "@workspace/db";

const router: IRouter = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [
    totalResult,
    pendingResult,
    approvedResult,
    rejectedResult,
    setsResult,
    typeResult,
    diffResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(questions),
    db.select({ count: sql<number>`count(*)::int` }).from(questions).where(eq(questions.status, "pending")),
    db.select({ count: sql<number>`count(*)::int` }).from(questions).where(eq(questions.status, "approved")),
    db.select({ count: sql<number>`count(*)::int` }).from(questions).where(eq(questions.status, "rejected")),
    db.select({ count: sql<number>`count(*)::int` }).from(questionSets),
    db
      .select({
        questionType: questions.questionType,
        count: sql<number>`count(*)::int`,
      })
      .from(questions)
      .groupBy(questions.questionType),
    db
      .select({
        difficulty: questions.difficulty,
        count: sql<number>`count(*)::int`,
      })
      .from(questions)
      .groupBy(questions.difficulty),
  ]);

  const byType = { MCQ: 0, CQ: 0, WRITTEN: 0 };
  for (const row of typeResult) {
    if (row.questionType === "MCQ") byType.MCQ = row.count;
    else if (row.questionType === "CQ") byType.CQ = row.count;
    else if (row.questionType === "WRITTEN") byType.WRITTEN = row.count;
  }

  const byDiff = { easy: 0, medium: 0, hard: 0 };
  for (const row of diffResult) {
    if (row.difficulty === "easy") byDiff.easy = row.count;
    else if (row.difficulty === "medium") byDiff.medium = row.count;
    else if (row.difficulty === "hard") byDiff.hard = row.count;
  }

  res.json({
    totalQuestions: totalResult[0]?.count ?? 0,
    pendingQuestions: pendingResult[0]?.count ?? 0,
    approvedQuestions: approvedResult[0]?.count ?? 0,
    rejectedQuestions: rejectedResult[0]?.count ?? 0,
    totalSets: setsResult[0]?.count ?? 0,
    questionsByType: byType,
    questionsByDifficulty: byDiff,
  });
});

// GET /dashboard/recent-questions
router.get("/dashboard/recent-questions", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: questions.id,
      questionType: questions.questionType,
      questionText: questions.questionText,
      status: questions.status,
      difficulty: questions.difficulty,
      language: questions.language,
      createdAt: questions.createdAt,
      subjectName: subjects.name,
      segmentName: segments.name,
    })
    .from(questions)
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(segments, eq(questions.segmentId, segments.id))
    .orderBy(desc(questions.createdAt))
    .limit(10);

  res.json(rows.map((r) => ({
    id: r.id,
    questionType: r.questionType,
    questionText: r.questionText,
    status: r.status,
    difficulty: r.difficulty ?? "medium",
    language: r.language,
    subjectName: r.subjectName ?? null,
    segmentName: r.segmentName ?? null,
    createdAt: r.createdAt.toISOString(),
  })));
});

export default router;

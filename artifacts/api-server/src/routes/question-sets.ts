import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, questionSets, questionSetItems, questions, subjects, segments } from "@workspace/db";

const router: IRouter = Router();

// GET /question-sets
router.get("/question-sets", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: questionSets.id,
      name: questionSets.name,
      segmentId: questionSets.segmentId,
      negativeMarking: questionSets.negativeMarking,
      createdBy: questionSets.createdBy,
      createdAt: questionSets.createdAt,
      itemCount: sql<number>`count(${questionSetItems.questionId})::int`,
    })
    .from(questionSets)
    .leftJoin(questionSetItems, eq(questionSets.id, questionSetItems.setId))
    .groupBy(questionSets.id)
    .orderBy(desc(questionSets.createdAt));

  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    segmentId: r.segmentId ?? null,
    negativeMarking: r.negativeMarking ? parseFloat(r.negativeMarking) : 0,
    createdBy: r.createdBy ?? null,
    createdAt: r.createdAt.toISOString(),
    itemCount: r.itemCount,
  })));
});

// POST /question-sets
router.post("/question-sets", async (req, res): Promise<void> => {
  const { name, segmentId, negativeMarking } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const [inserted] = await db
    .insert(questionSets)
    .values({
      name,
      segmentId: segmentId ?? null,
      negativeMarking: negativeMarking ? String(negativeMarking) : "0",
    })
    .returning();

  res.status(201).json({
    id: inserted.id,
    name: inserted.name,
    segmentId: inserted.segmentId ?? null,
    negativeMarking: inserted.negativeMarking ? parseFloat(inserted.negativeMarking) : 0,
    createdBy: inserted.createdBy ?? null,
    createdAt: inserted.createdAt.toISOString(),
    itemCount: 0,
  });
});

// GET /question-sets/:setId
router.get("/question-sets/:setId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.setId) ? req.params.setId[0] : req.params.setId;
  const setId = parseInt(raw, 10);
  if (isNaN(setId)) {
    res.status(400).json({ error: "Invalid set ID" });
    return;
  }

  const [set] = await db.select().from(questionSets).where(eq(questionSets.id, setId));
  if (!set) {
    res.status(404).json({ error: "Question set not found" });
    return;
  }

  const items = await db
    .select({
      setId: questionSetItems.setId,
      questionId: questionSetItems.questionId,
      orderNo: questionSetItems.orderNo,
      marksOverride: questionSetItems.marksOverride,
      questionType: questions.questionType,
      questionText: questions.questionText,
      status: questions.status,
      difficulty: questions.difficulty,
      language: questions.language,
      createdAt: questions.createdAt,
      subjectName: subjects.name,
      segmentName: segments.name,
    })
    .from(questionSetItems)
    .leftJoin(questions, eq(questionSetItems.questionId, questions.id))
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(segments, eq(questions.segmentId, segments.id))
    .where(eq(questionSetItems.setId, setId))
    .orderBy(questionSetItems.orderNo);

  res.json({
    id: set.id,
    name: set.name,
    segmentId: set.segmentId ?? null,
    negativeMarking: set.negativeMarking ? parseFloat(set.negativeMarking) : 0,
    createdBy: set.createdBy ?? null,
    createdAt: set.createdAt.toISOString(),
    items: items.map((item) => ({
      setId: item.setId,
      questionId: item.questionId,
      orderNo: item.orderNo ?? 0,
      marksOverride: item.marksOverride ? parseFloat(item.marksOverride) : null,
      question: {
        id: item.questionId,
        questionType: item.questionType ?? "MCQ",
        questionText: item.questionText ?? "",
        status: item.status ?? "pending",
        difficulty: item.difficulty ?? "medium",
        language: item.language ?? "bn",
        subjectName: item.subjectName ?? null,
        segmentName: item.segmentName ?? null,
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      },
    })),
  });
});

// DELETE /question-sets/:setId
router.delete("/question-sets/:setId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.setId) ? req.params.setId[0] : req.params.setId;
  const setId = parseInt(raw, 10);
  if (isNaN(setId)) {
    res.status(400).json({ error: "Invalid set ID" });
    return;
  }
  await db.delete(questionSets).where(eq(questionSets.id, setId));
  res.sendStatus(204);
});

// POST /question-sets/:setId/items
router.post("/question-sets/:setId/items", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.setId) ? req.params.setId[0] : req.params.setId;
  const setId = parseInt(raw, 10);
  if (isNaN(setId)) {
    res.status(400).json({ error: "Invalid set ID" });
    return;
  }

  const { questionId, orderNo, marksOverride } = req.body;
  if (!questionId) {
    res.status(400).json({ error: "questionId is required" });
    return;
  }

  await db
    .insert(questionSetItems)
    .values({
      setId,
      questionId,
      orderNo: orderNo ?? 0,
      marksOverride: marksOverride ? String(marksOverride) : null,
    })
    .onConflictDoNothing();

  // Return updated set detail
  const [set] = await db.select().from(questionSets).where(eq(questionSets.id, setId));
  if (!set) {
    res.status(404).json({ error: "Question set not found" });
    return;
  }

  const items = await db
    .select({
      setId: questionSetItems.setId,
      questionId: questionSetItems.questionId,
      orderNo: questionSetItems.orderNo,
      marksOverride: questionSetItems.marksOverride,
      questionType: questions.questionType,
      questionText: questions.questionText,
      status: questions.status,
      difficulty: questions.difficulty,
      language: questions.language,
      createdAt: questions.createdAt,
      subjectName: subjects.name,
      segmentName: segments.name,
    })
    .from(questionSetItems)
    .leftJoin(questions, eq(questionSetItems.questionId, questions.id))
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(segments, eq(questions.segmentId, segments.id))
    .where(eq(questionSetItems.setId, setId))
    .orderBy(questionSetItems.orderNo);

  res.status(201).json({
    id: set.id,
    name: set.name,
    segmentId: set.segmentId ?? null,
    negativeMarking: set.negativeMarking ? parseFloat(set.negativeMarking) : 0,
    createdBy: set.createdBy ?? null,
    createdAt: set.createdAt.toISOString(),
    items: items.map((item) => ({
      setId: item.setId,
      questionId: item.questionId,
      orderNo: item.orderNo ?? 0,
      marksOverride: item.marksOverride ? parseFloat(item.marksOverride) : null,
      question: {
        id: item.questionId,
        questionType: item.questionType ?? "MCQ",
        questionText: item.questionText ?? "",
        status: item.status ?? "pending",
        difficulty: item.difficulty ?? "medium",
        language: item.language ?? "bn",
        subjectName: item.subjectName ?? null,
        segmentName: item.segmentName ?? null,
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      },
    })),
  });
});

// DELETE /question-sets/:setId/items/:questionId
router.delete("/question-sets/:setId/items/:questionId", async (req, res): Promise<void> => {
  const rawSet = Array.isArray(req.params.setId) ? req.params.setId[0] : req.params.setId;
  const rawQ = Array.isArray(req.params.questionId) ? req.params.questionId[0] : req.params.questionId;
  const setId = parseInt(rawSet, 10);
  const questionId = parseInt(rawQ, 10);
  if (isNaN(setId) || isNaN(questionId)) {
    res.status(400).json({ error: "Invalid IDs" });
    return;
  }

  await db
    .delete(questionSetItems)
    .where(
      eq(questionSetItems.setId, setId)
    );

  res.sendStatus(204);
});

export default router;

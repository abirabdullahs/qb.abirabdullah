import { Router, type IRouter } from "express";
import { eq, and, desc, sql, type SQL } from "drizzle-orm";
import {
  db,
  questions,
  questionOptions,
  questionSubParts,
  subjects,
  segments,
  chapters,
} from "@workspace/db";

const router: IRouter = Router();

function buildQuestionFilters(query: Record<string, unknown>): SQL[] {
  const filters: SQL[] = [];
  if (query.segmentId) filters.push(eq(questions.segmentId, parseInt(query.segmentId as string, 10)));
  if (query.subjectId) filters.push(eq(questions.subjectId, parseInt(query.subjectId as string, 10)));
  if (query.chapterId) filters.push(eq(questions.chapterId, parseInt(query.chapterId as string, 10)));
  if (query.topicId) filters.push(eq(questions.topicId, parseInt(query.topicId as string, 10)));
  if (query.questionType) filters.push(eq(questions.questionType, query.questionType as string));
  if (query.difficulty) filters.push(eq(questions.difficulty, query.difficulty as string));
  if (query.status) filters.push(eq(questions.status, query.status as string));
  if (query.language) filters.push(eq(questions.language, query.language as string));
  if (query.year) filters.push(eq(questions.year, parseInt(query.year as string, 10) as unknown as never));
  return filters;
}

// GET /questions
router.get("/questions", async (req, res): Promise<void> => {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = Math.min(parseInt((req.query.limit as string) ?? "20", 10), 100);
  const offset = (page - 1) * limit;

  const filters = buildQuestionFilters(req.query as Record<string, unknown>);
  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .where(whereClause),
    db
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
      .where(whereClause)
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  res.json({
    data: rows.map((r) => ({
      id: r.id,
      questionType: r.questionType,
      questionText: r.questionText,
      status: r.status,
      difficulty: r.difficulty ?? "medium",
      language: r.language,
      subjectName: r.subjectName ?? null,
      segmentName: r.segmentName ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  });
});

// GET /questions/:questionId
router.get("/questions/:questionId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.questionId) ? req.params.questionId[0] : req.params.questionId;
  const questionId = parseInt(raw, 10);
  if (isNaN(questionId)) {
    res.status(400).json({ error: "Invalid question ID" });
    return;
  }

  const [q] = await db
    .select({
      q: questions,
      subjectName: subjects.name,
      segmentName: segments.name,
      chapterName: chapters.name,
    })
    .from(questions)
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(segments, eq(questions.segmentId, segments.id))
    .leftJoin(chapters, eq(questions.chapterId, chapters.id))
    .where(eq(questions.id, questionId));

  if (!q) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const [options, subParts] = await Promise.all([
    db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId)).orderBy(questionOptions.orderNo),
    db.select().from(questionSubParts).where(eq(questionSubParts.questionId, questionId)).orderBy(questionSubParts.orderNo),
  ]);

  res.json({
    id: q.q.id,
    segmentId: q.q.segmentId,
    groupId: q.q.groupId ?? null,
    admissionSegmentId: q.q.admissionSegmentId ?? null,
    admissionExamId: q.q.admissionExamId ?? null,
    admissionUnitId: q.q.admissionUnitId ?? null,
    instituteId: q.q.instituteId ?? null,
    subjectId: q.q.subjectId,
    chapterId: q.q.chapterId ?? null,
    topicId: q.q.topicId ?? null,
    subTopicId: q.q.subTopicId ?? null,
    questionType: q.q.questionType,
    stimulusText: q.q.stimulusText ?? null,
    questionText: q.q.questionText,
    hasMath: q.q.hasMath,
    cqStyle: q.q.cqStyle ?? null,
    year: q.q.year ? Number(q.q.year) : null,
    examName: q.q.examName ?? null,
    isPreviousYear: q.q.isPreviousYear,
    marks: q.q.marks ? parseFloat(q.q.marks) : null,
    difficulty: q.q.difficulty ?? "medium",
    language: q.q.language,
    answerText: q.q.answerText ?? null,
    explanationText: q.q.explanationText ?? null,
    videoSolutionUrl: q.q.videoSolutionUrl ?? null,
    status: q.q.status,
    contributorId: q.q.contributorId ?? null,
    reviewedBy: q.q.reviewedBy ?? null,
    createdAt: q.q.createdAt.toISOString(),
    updatedAt: q.q.updatedAt.toISOString(),
    segmentName: q.segmentName ?? null,
    subjectName: q.subjectName ?? null,
    chapterName: q.chapterName ?? null,
    options: options.map((o) => ({
      id: o.id,
      questionId: o.questionId,
      optionLabel: o.optionLabel,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
      explanationText: o.explanationText ?? null,
      orderNo: o.orderNo ?? 0,
    })),
    subParts: subParts.map((s) => ({
      id: s.id,
      questionId: s.questionId,
      partLabel: s.partLabel,
      partText: s.partText,
      marks: s.marks ? parseFloat(s.marks) : null,
      cognitiveLevel: s.cognitiveLevel ?? null,
      answerText: s.answerText ?? null,
      explanationText: s.explanationText ?? null,
      orderNo: s.orderNo ?? 0,
    })),
  });
});

// POST /questions
router.post("/questions", async (req, res): Promise<void> => {
  const body = req.body;
  if (!body.segmentId || !body.subjectId || !body.questionType || !body.questionText || !body.language) {
    res.status(400).json({ error: "Missing required fields: segmentId, subjectId, questionType, questionText, language" });
    return;
  }

  const [inserted] = await db
    .insert(questions)
    .values({
      segmentId: body.segmentId,
      groupId: body.groupId ?? null,
      admissionSegmentId: body.admissionSegmentId ?? null,
      admissionExamId: body.admissionExamId ?? null,
      admissionUnitId: body.admissionUnitId ?? null,
      instituteId: body.instituteId ?? null,
      subjectId: body.subjectId,
      chapterId: body.chapterId ?? null,
      topicId: body.topicId ?? null,
      subTopicId: body.subTopicId ?? null,
      questionType: body.questionType,
      stimulusText: body.stimulusText ?? null,
      questionText: body.questionText,
      hasMath: body.hasMath ?? false,
      year: body.year ?? null,
      examName: body.examName ?? null,
      isPreviousYear: body.isPreviousYear ?? false,
      marks: body.marks ? String(body.marks) : null,
      difficulty: body.difficulty ?? "medium",
      language: body.language,
      answerText: body.answerText ?? null,
      explanationText: body.explanationText ?? null,
      videoSolutionUrl: body.videoSolutionUrl ?? null,
      status: "pending",
    })
    .returning();

  // Insert options if MCQ
  if (body.options && Array.isArray(body.options) && inserted) {
    await db.insert(questionOptions).values(
      body.options.map((o: { optionLabel: string; optionText: string; isCorrect?: boolean; explanationText?: string; orderNo?: number }) => ({
        questionId: inserted.id,
        optionLabel: o.optionLabel,
        optionText: o.optionText,
        isCorrect: o.isCorrect ?? false,
        explanationText: o.explanationText ?? null,
        orderNo: o.orderNo ?? 0,
      }))
    );
  }

  // Insert sub-parts if CQ
  if (body.subParts && Array.isArray(body.subParts) && inserted) {
    await db.insert(questionSubParts).values(
      body.subParts.map((s: { partLabel: string; partText: string; marks?: number; cognitiveLevel?: string; answerText?: string; explanationText?: string; orderNo?: number }) => ({
        questionId: inserted.id,
        partLabel: s.partLabel,
        partText: s.partText,
        marks: s.marks ? String(s.marks) : null,
        cognitiveLevel: s.cognitiveLevel ?? null,
        answerText: s.answerText ?? null,
        explanationText: s.explanationText ?? null,
        orderNo: s.orderNo ?? 0,
      }))
    );
  }

  // Return full question
  const [full] = await db
    .select({
      q: questions,
      subjectName: subjects.name,
      segmentName: segments.name,
      chapterName: chapters.name,
    })
    .from(questions)
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(segments, eq(questions.segmentId, segments.id))
    .leftJoin(chapters, eq(questions.chapterId, chapters.id))
    .where(eq(questions.id, inserted.id));

  const [opts, subs] = await Promise.all([
    db.select().from(questionOptions).where(eq(questionOptions.questionId, inserted.id)).orderBy(questionOptions.orderNo),
    db.select().from(questionSubParts).where(eq(questionSubParts.questionId, inserted.id)).orderBy(questionSubParts.orderNo),
  ]);

  res.status(201).json({
    id: full.q.id,
    segmentId: full.q.segmentId,
    groupId: full.q.groupId ?? null,
    admissionSegmentId: full.q.admissionSegmentId ?? null,
    admissionExamId: full.q.admissionExamId ?? null,
    admissionUnitId: full.q.admissionUnitId ?? null,
    instituteId: full.q.instituteId ?? null,
    subjectId: full.q.subjectId,
    chapterId: full.q.chapterId ?? null,
    topicId: full.q.topicId ?? null,
    subTopicId: full.q.subTopicId ?? null,
    questionType: full.q.questionType,
    stimulusText: full.q.stimulusText ?? null,
    questionText: full.q.questionText,
    hasMath: full.q.hasMath,
    cqStyle: full.q.cqStyle ?? null,
    year: full.q.year ? Number(full.q.year) : null,
    examName: full.q.examName ?? null,
    isPreviousYear: full.q.isPreviousYear,
    marks: full.q.marks ? parseFloat(full.q.marks) : null,
    difficulty: full.q.difficulty ?? "medium",
    language: full.q.language,
    answerText: full.q.answerText ?? null,
    explanationText: full.q.explanationText ?? null,
    videoSolutionUrl: full.q.videoSolutionUrl ?? null,
    status: full.q.status,
    contributorId: full.q.contributorId ?? null,
    reviewedBy: full.q.reviewedBy ?? null,
    createdAt: full.q.createdAt.toISOString(),
    updatedAt: full.q.updatedAt.toISOString(),
    segmentName: full.segmentName ?? null,
    subjectName: full.subjectName ?? null,
    chapterName: full.chapterName ?? null,
    options: opts.map((o) => ({
      id: o.id,
      questionId: o.questionId,
      optionLabel: o.optionLabel,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
      explanationText: o.explanationText ?? null,
      orderNo: o.orderNo ?? 0,
    })),
    subParts: subs.map((s) => ({
      id: s.id,
      questionId: s.questionId,
      partLabel: s.partLabel,
      partText: s.partText,
      marks: s.marks ? parseFloat(s.marks) : null,
      cognitiveLevel: s.cognitiveLevel ?? null,
      answerText: s.answerText ?? null,
      explanationText: s.explanationText ?? null,
      orderNo: s.orderNo ?? 0,
    })),
  });
});

// PATCH /questions/:questionId
router.patch("/questions/:questionId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.questionId) ? req.params.questionId[0] : req.params.questionId;
  const questionId = parseInt(raw, 10);
  if (isNaN(questionId)) {
    res.status(400).json({ error: "Invalid question ID" });
    return;
  }

  const body = req.body;
  const updateData: Record<string, unknown> = {};
  if (body.questionText !== undefined) updateData.questionText = body.questionText;
  if (body.stimulusText !== undefined) updateData.stimulusText = body.stimulusText;
  if (body.answerText !== undefined) updateData.answerText = body.answerText;
  if (body.explanationText !== undefined) updateData.explanationText = body.explanationText;
  if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
  if (body.marks !== undefined) updateData.marks = body.marks ? String(body.marks) : null;
  if (body.year !== undefined) updateData.year = body.year;
  if (body.chapterId !== undefined) updateData.chapterId = body.chapterId;
  if (body.topicId !== undefined) updateData.topicId = body.topicId;
  if (body.hasMath !== undefined) updateData.hasMath = body.hasMath;
  if (body.videoSolutionUrl !== undefined) updateData.videoSolutionUrl = body.videoSolutionUrl;
  updateData.updatedAt = new Date();

  const [updated] = await db.update(questions).set(updateData).where(eq(questions.id, questionId)).returning();
  if (!updated) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  // Update options if provided
  if (body.options && Array.isArray(body.options)) {
    await db.delete(questionOptions).where(eq(questionOptions.questionId, questionId));
    if (body.options.length > 0) {
      await db.insert(questionOptions).values(
        body.options.map((o: { optionLabel: string; optionText: string; isCorrect?: boolean; explanationText?: string; orderNo?: number }) => ({
          questionId,
          optionLabel: o.optionLabel,
          optionText: o.optionText,
          isCorrect: o.isCorrect ?? false,
          explanationText: o.explanationText ?? null,
          orderNo: o.orderNo ?? 0,
        }))
      );
    }
  }

  // Update sub-parts if provided
  if (body.subParts && Array.isArray(body.subParts)) {
    await db.delete(questionSubParts).where(eq(questionSubParts.questionId, questionId));
    if (body.subParts.length > 0) {
      await db.insert(questionSubParts).values(
        body.subParts.map((s: { partLabel: string; partText: string; marks?: number; cognitiveLevel?: string; answerText?: string; explanationText?: string; orderNo?: number }) => ({
          questionId,
          partLabel: s.partLabel,
          partText: s.partText,
          marks: s.marks ? String(s.marks) : null,
          cognitiveLevel: s.cognitiveLevel ?? null,
          answerText: s.answerText ?? null,
          explanationText: s.explanationText ?? null,
          orderNo: s.orderNo ?? 0,
        }))
      );
    }
  }

  const [full] = await db
    .select({
      q: questions,
      subjectName: subjects.name,
      segmentName: segments.name,
      chapterName: chapters.name,
    })
    .from(questions)
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(segments, eq(questions.segmentId, segments.id))
    .leftJoin(chapters, eq(questions.chapterId, chapters.id))
    .where(eq(questions.id, questionId));

  const [opts, subs] = await Promise.all([
    db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId)).orderBy(questionOptions.orderNo),
    db.select().from(questionSubParts).where(eq(questionSubParts.questionId, questionId)).orderBy(questionSubParts.orderNo),
  ]);

  res.json({
    id: full.q.id,
    segmentId: full.q.segmentId,
    groupId: full.q.groupId ?? null,
    admissionSegmentId: full.q.admissionSegmentId ?? null,
    admissionExamId: full.q.admissionExamId ?? null,
    admissionUnitId: full.q.admissionUnitId ?? null,
    instituteId: full.q.instituteId ?? null,
    subjectId: full.q.subjectId,
    chapterId: full.q.chapterId ?? null,
    topicId: full.q.topicId ?? null,
    subTopicId: full.q.subTopicId ?? null,
    questionType: full.q.questionType,
    stimulusText: full.q.stimulusText ?? null,
    questionText: full.q.questionText,
    hasMath: full.q.hasMath,
    cqStyle: full.q.cqStyle ?? null,
    year: full.q.year ? Number(full.q.year) : null,
    examName: full.q.examName ?? null,
    isPreviousYear: full.q.isPreviousYear,
    marks: full.q.marks ? parseFloat(full.q.marks) : null,
    difficulty: full.q.difficulty ?? "medium",
    language: full.q.language,
    answerText: full.q.answerText ?? null,
    explanationText: full.q.explanationText ?? null,
    videoSolutionUrl: full.q.videoSolutionUrl ?? null,
    status: full.q.status,
    contributorId: full.q.contributorId ?? null,
    reviewedBy: full.q.reviewedBy ?? null,
    createdAt: full.q.createdAt.toISOString(),
    updatedAt: full.q.updatedAt.toISOString(),
    segmentName: full.segmentName ?? null,
    subjectName: full.subjectName ?? null,
    chapterName: full.chapterName ?? null,
    options: opts.map((o) => ({
      id: o.id,
      questionId: o.questionId,
      optionLabel: o.optionLabel,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
      explanationText: o.explanationText ?? null,
      orderNo: o.orderNo ?? 0,
    })),
    subParts: subs.map((s) => ({
      id: s.id,
      questionId: s.questionId,
      partLabel: s.partLabel,
      partText: s.partText,
      marks: s.marks ? parseFloat(s.marks) : null,
      cognitiveLevel: s.cognitiveLevel ?? null,
      answerText: s.answerText ?? null,
      explanationText: s.explanationText ?? null,
      orderNo: s.orderNo ?? 0,
    })),
  });
});

// DELETE /questions/:questionId
router.delete("/questions/:questionId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.questionId) ? req.params.questionId[0] : req.params.questionId;
  const questionId = parseInt(raw, 10);
  if (isNaN(questionId)) {
    res.status(400).json({ error: "Invalid question ID" });
    return;
  }
  await db.delete(questions).where(eq(questions.id, questionId));
  res.sendStatus(204);
});

// PATCH /questions/:questionId/status
router.patch("/questions/:questionId/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.questionId) ? req.params.questionId[0] : req.params.questionId;
  const questionId = parseInt(raw, 10);
  if (isNaN(questionId)) {
    res.status(400).json({ error: "Invalid question ID" });
    return;
  }

  const { status } = req.body;
  if (!status || !["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    return;
  }

  const [updated] = await db
    .update(questions)
    .set({ status, updatedAt: new Date() })
    .where(eq(questions.id, questionId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const [full] = await db
    .select({
      q: questions,
      subjectName: subjects.name,
      segmentName: segments.name,
      chapterName: chapters.name,
    })
    .from(questions)
    .leftJoin(subjects, eq(questions.subjectId, subjects.id))
    .leftJoin(segments, eq(questions.segmentId, segments.id))
    .leftJoin(chapters, eq(questions.chapterId, chapters.id))
    .where(eq(questions.id, questionId));

  res.json({
    id: full.q.id,
    segmentId: full.q.segmentId,
    groupId: full.q.groupId ?? null,
    admissionSegmentId: full.q.admissionSegmentId ?? null,
    admissionExamId: full.q.admissionExamId ?? null,
    admissionUnitId: full.q.admissionUnitId ?? null,
    instituteId: full.q.instituteId ?? null,
    subjectId: full.q.subjectId,
    chapterId: full.q.chapterId ?? null,
    topicId: full.q.topicId ?? null,
    subTopicId: full.q.subTopicId ?? null,
    questionType: full.q.questionType,
    stimulusText: full.q.stimulusText ?? null,
    questionText: full.q.questionText,
    hasMath: full.q.hasMath,
    cqStyle: full.q.cqStyle ?? null,
    year: full.q.year ? Number(full.q.year) : null,
    examName: full.q.examName ?? null,
    isPreviousYear: full.q.isPreviousYear,
    marks: full.q.marks ? parseFloat(full.q.marks) : null,
    difficulty: full.q.difficulty ?? "medium",
    language: full.q.language,
    answerText: full.q.answerText ?? null,
    explanationText: full.q.explanationText ?? null,
    videoSolutionUrl: full.q.videoSolutionUrl ?? null,
    status: full.q.status,
    contributorId: full.q.contributorId ?? null,
    reviewedBy: full.q.reviewedBy ?? null,
    createdAt: full.q.createdAt.toISOString(),
    updatedAt: full.q.updatedAt.toISOString(),
    segmentName: full.segmentName ?? null,
    subjectName: full.subjectName ?? null,
    chapterName: full.chapterName ?? null,
    options: [],
    subParts: [],
  });
});

export default router;

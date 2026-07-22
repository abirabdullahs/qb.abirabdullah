import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, segments, groups, subjects, chapters, topics, boards } from "@workspace/db";

const router: IRouter = Router();

// GET /segments
router.get("/segments", async (_req, res): Promise<void> => {
  const rows = await db.select().from(segments).orderBy(segments.name);
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    segmentKind: r.segmentKind,
    createdAt: r.createdAt.toISOString(),
  })));
});

// GET /groups?segmentId=
router.get("/groups", async (req, res): Promise<void> => {
  const segmentId = req.query.segmentId ? parseInt(req.query.segmentId as string, 10) : undefined;
  const q = db.select().from(groups).orderBy(groups.name);
  const rows = segmentId
    ? await db.select().from(groups).where(eq(groups.segmentId, segmentId)).orderBy(groups.name)
    : await q;
  res.json(rows.map((r) => ({
    id: r.id,
    segmentId: r.segmentId,
    name: r.name,
    code: r.code ?? null,
  })));
});

// GET /subjects
router.get("/subjects", async (_req, res): Promise<void> => {
  const rows = await db.select().from(subjects).orderBy(subjects.name);
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code ?? null,
  })));
});

// GET /chapters?subjectId=
router.get("/chapters", async (req, res): Promise<void> => {
  const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string, 10) : undefined;
  const rows = subjectId
    ? await db.select().from(chapters).where(eq(chapters.subjectId, subjectId)).orderBy(chapters.orderNo, chapters.name)
    : await db.select().from(chapters).orderBy(chapters.orderNo, chapters.name);
  res.json(rows.map((r) => ({
    id: r.id,
    subjectId: r.subjectId,
    name: r.name,
    orderNo: r.orderNo ?? 0,
  })));
});

// GET /topics?chapterId=
router.get("/topics", async (req, res): Promise<void> => {
  const chapterId = req.query.chapterId ? parseInt(req.query.chapterId as string, 10) : undefined;
  const rows = chapterId
    ? await db.select().from(topics).where(eq(topics.chapterId, chapterId)).orderBy(topics.orderNo, topics.name)
    : await db.select().from(topics).orderBy(topics.orderNo, topics.name);
  res.json(rows.map((r) => ({
    id: r.id,
    chapterId: r.chapterId,
    name: r.name,
    orderNo: r.orderNo ?? 0,
  })));
});

// GET /boards
router.get("/boards", async (_req, res): Promise<void> => {
  const rows = await db.select().from(boards).orderBy(boards.name);
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code ?? null,
  })));
});

export default router;

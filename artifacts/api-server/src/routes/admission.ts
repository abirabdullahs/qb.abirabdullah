import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  admissionSegments,
  institutes,
  admissionExams,
  admissionUnits,
} from "@workspace/db";

const router: IRouter = Router();

// GET /admission-segments
router.get("/admission-segments", async (_req, res): Promise<void> => {
  const rows = await db.select().from(admissionSegments).orderBy(admissionSegments.name);
  res.json(rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code ?? null,
  })));
});

// GET /institutes?admissionSegmentId=
router.get("/institutes", async (req, res): Promise<void> => {
  const admissionSegmentId = req.query.admissionSegmentId
    ? parseInt(req.query.admissionSegmentId as string, 10)
    : undefined;
  const rows = admissionSegmentId
    ? await db.select().from(institutes).where(eq(institutes.admissionSegmentId, admissionSegmentId)).orderBy(institutes.name)
    : await db.select().from(institutes).orderBy(institutes.name);
  res.json(rows.map((r) => ({
    id: r.id,
    admissionSegmentId: r.admissionSegmentId,
    name: r.name,
    shortName: r.shortName ?? null,
    location: r.location ?? null,
  })));
});

// GET /admission-exams?admissionSegmentId=
router.get("/admission-exams", async (req, res): Promise<void> => {
  const admissionSegmentId = req.query.admissionSegmentId
    ? parseInt(req.query.admissionSegmentId as string, 10)
    : undefined;
  const rows = admissionSegmentId
    ? await db.select().from(admissionExams).where(eq(admissionExams.admissionSegmentId, admissionSegmentId)).orderBy(admissionExams.examYear)
    : await db.select().from(admissionExams).orderBy(admissionExams.examYear);
  res.json(rows.map((r) => ({
    id: r.id,
    admissionSegmentId: r.admissionSegmentId,
    name: r.name,
    examYear: Number(r.examYear),
    conductingBody: r.conductingBody ?? null,
    examType: r.examType,
    instituteId: r.instituteId ?? null,
    negativeMarking: r.negativeMarking ? parseFloat(r.negativeMarking) : null,
    createdAt: r.createdAt.toISOString(),
  })));
});

// GET /admission-units?admissionExamId=
router.get("/admission-units", async (req, res): Promise<void> => {
  const admissionExamId = req.query.admissionExamId
    ? parseInt(req.query.admissionExamId as string, 10)
    : undefined;
  const rows = admissionExamId
    ? await db.select().from(admissionUnits).where(eq(admissionUnits.admissionExamId, admissionExamId)).orderBy(admissionUnits.unitName)
    : await db.select().from(admissionUnits).orderBy(admissionUnits.unitName);
  res.json(rows.map((r) => ({
    id: r.id,
    admissionExamId: r.admissionExamId,
    unitName: r.unitName,
    description: r.description ?? null,
  })));
});

export default router;

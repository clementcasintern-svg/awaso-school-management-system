import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const scoreSchema = z.object({
  studentId: z.string(),
  examId: z.string(),
  score: z.number().min(0).max(100),
  remarks: z.string().optional()
});

// Get all scores
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, studentId, examId } = req.query;

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (examId) where.examId = examId;

  const [scores, total] = await Promise.all([
    prisma.examScore.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        student: true,
        exam: { include: { subject: true } }
      }
    }),
    prisma.examScore.count({ where })
  ]);

  res.json({
    success: true,
    data: scores,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Create score
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const data = scoreSchema.parse(req.body);

  const score = await prisma.examScore.create({
    data,
    include: {
      student: true,
      exam: true
    }
  });

  res.status(201).json({
    success: true,
    data: score
  });
}));

// Bulk create scores
router.post('/bulk', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const { records } = req.body;

  const scores = await prisma.examScore.createMany({
    data: records
  });

  res.status(201).json({
    success: true,
    message: `${scores.count} scores created`,
    data: scores
  });
}));

// Update score
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const data = scoreSchema.partial().parse(req.body);

  const score = await prisma.examScore.update({
    where: { id: req.params.id },
    data,
    include: {
      student: true,
      exam: true
    }
  });

  res.json({
    success: true,
    data: score
  });
}));

// Get student grades
router.get('/student/:studentId', asyncHandler(async (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const { examId } = req.query;

  const where: any = { studentId };
  if (examId) where.examId = examId;

  const scores = await prisma.examScore.findMany({
    where,
    include: {
      exam: { include: { subject: true } }
    }
  });

  res.json({
    success: true,
    data: scores
  });
}));

// Calculate GPA
router.get('/gpa/:studentId', asyncHandler(async (req: AuthRequest, res) => {
  const { studentId } = req.params;

  const scores = await prisma.examScore.findMany({
    where: { studentId },
    include: { exam: true }
  });

  if (scores.length === 0) {
    return res.json({
      success: true,
      data: { gpa: 0, totalScores: 0 }
    });
  }

  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const gpa = (totalScore / scores.length).toFixed(2);

  res.json({
    success: true,
    data: {
      gpa,
      totalScores: scores.length,
      scores
    }
  });
}));

export default router;

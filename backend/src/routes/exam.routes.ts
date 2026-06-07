import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const examSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['CONTINUOUS_ASSESSMENT', 'MIDTERM', 'END_OF_TERM', 'WASSCE']),
  classId: z.string(),
  subjectId: z.string(),
  totalScore: z.number().positive(),
  passScore: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

// Get all exams
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, classId, subjectId, type } = req.query;

  const where: any = {};
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (type) where.type = type;

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        class: true,
        subject: true,
        scores: true
      }
    }),
    prisma.exam.count({ where })
  ]);

  res.json({
    success: true,
    data: exams,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get exam by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const exam = await prisma.exam.findUnique({
    where: { id: req.params.id },
    include: {
      class: true,
      subject: true,
      scores: { include: { student: true } }
    }
  });

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  res.json({
    success: true,
    data: exam
  });
}));

// Create exam
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = examSchema.parse(req.body);

  const exam = await prisma.exam.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    },
    include: {
      class: true,
      subject: true
    }
  });

  res.status(201).json({
    success: true,
    data: exam
  });
}));

// Update exam
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = examSchema.partial().parse(req.body);

  const exam = await prisma.exam.update({
    where: { id: req.params.id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    },
    include: {
      class: true,
      subject: true
    }
  });

  res.json({
    success: true,
    data: exam
  });
}));

// Delete exam
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.exam.delete({
    where: { id: req.params.id }
  });

  res.json({
    success: true,
    message: 'Exam deleted successfully'
  });
}));

export default router;

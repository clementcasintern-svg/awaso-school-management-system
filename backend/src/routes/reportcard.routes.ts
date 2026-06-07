import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const reportCardSchema = z.object({
  studentId: z.string(),
  termId: z.string(),
  academicYearId: z.string(),
  teacherRemarks: z.string().optional(),
  headmasterRemarks: z.string().optional(),
  gpa: z.number().min(0).max(4)
});

// Get all report cards
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, studentId, academicYearId } = req.query;

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (academicYearId) where.academicYearId = academicYearId;

  const [cards, total] = await Promise.all([
    prisma.reportCard.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        student: true,
        term: true,
        academicYear: true,
        grades: { include: { subject: true } }
      }
    }),
    prisma.reportCard.count({ where })
  ]);

  res.json({
    success: true,
    data: cards,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get report card by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const card = await prisma.reportCard.findUnique({
    where: { id: req.params.id },
    include: {
      student: true,
      term: true,
      academicYear: true,
      grades: { include: { subject: true } }
    }
  });

  if (!card) {
    return res.status(404).json({
      success: false,
      message: 'Report card not found'
    });
  }

  res.json({
    success: true,
    data: card
  });
}));

// Create report card
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const data = reportCardSchema.parse(req.body);

  const card = await prisma.reportCard.create({
    data,
    include: {
      student: true,
      term: true,
      academicYear: true
    }
  });

  res.status(201).json({
    success: true,
    data: card
  });
}));

// Update report card
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const data = reportCardSchema.partial().parse(req.body);

  const card = await prisma.reportCard.update({
    where: { id: req.params.id },
    data,
    include: {
      student: true,
      grades: { include: { subject: true } }
    }
  });

  res.json({
    success: true,
    data: card
  });
}));

export default router;

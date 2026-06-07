import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const subjectSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  departmentId: z.string()
});

// Get all subjects
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, departmentId } = req.query;

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { department: true }
    }),
    prisma.subject.count({ where })
  ]);

  res.json({
    success: true,
    data: subjects,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get subject by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const subject = await prisma.subject.findUnique({
    where: { id: req.params.id },
    include: {
      department: true,
      classes: true,
      teachers: true
    }
  });

  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found'
    });
  }

  res.json({
    success: true,
    data: subject
  });
}));

// Create subject
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = subjectSchema.parse(req.body);

  const subject = await prisma.subject.create({
    data,
    include: { department: true }
  });

  res.status(201).json({
    success: true,
    data: subject
  });
}));

// Update subject
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = subjectSchema.partial().parse(req.body);

  const subject = await prisma.subject.update({
    where: { id: req.params.id },
    data,
    include: { department: true }
  });

  res.json({
    success: true,
    data: subject
  });
}));

// Delete subject
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.subject.delete({
    where: { id: req.params.id }
  });

  res.json({
    success: true,
    message: 'Subject deleted successfully'
  });
}));

export default router;

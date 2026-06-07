import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const teacherSchema = z.object({
  teacherId: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  qualifications: z.string().optional(),
  departmentId: z.string()
});

// Get all teachers
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, departmentId, search } = req.query;

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;
  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { teacherId: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        department: true,
        classes: true,
        subjects: true
      }
    }),
    prisma.teacher.count({ where })
  ]);

  res.json({
    success: true,
    data: teachers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get teacher by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: req.params.id },
    include: {
      department: true,
      classes: true,
      subjects: true,
      attendances: true
    }
  });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher not found'
    });
  }

  res.json({
    success: true,
    data: teacher
  });
}));

// Create teacher
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = teacherSchema.parse(req.body);

  const teacher = await prisma.teacher.create({
    data,
    include: {
      department: true
    }
  });

  res.status(201).json({
    success: true,
    data: teacher
  });
}));

// Update teacher
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = teacherSchema.partial().parse(req.body);

  const teacher = await prisma.teacher.update({
    where: { id: req.params.id },
    data,
    include: {
      department: true,
      classes: true,
      subjects: true
    }
  });

  res.json({
    success: true,
    data: teacher
  });
}));

// Delete teacher
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.teacher.delete({
    where: { id: req.params.id }
  });

  res.json({
    success: true,
    message: 'Teacher deleted successfully'
  });
}));

export default router;

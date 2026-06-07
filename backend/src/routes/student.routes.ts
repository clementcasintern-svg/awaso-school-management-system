import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const studentSchema = z.object({
  studentId: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  nationality: z.string(),
  phone: z.string().optional(),
  classId: z.string(),
  parentId: z.string().optional()
});

// Get all students
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, classId, search } = req.query;

  const where: any = {};
  if (classId) where.classId = classId;
  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { studentId: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        class: true,
        parent: true,
        attendances: true
      }
    }),
    prisma.student.count({ where })
  ]);

  res.json({
    success: true,
    data: students,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get student by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      class: true,
      parent: true,
      attendances: true,
      grades: true,
      fees: true
    }
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  res.json({
    success: true,
    data: student
  });
}));

// Create student
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = studentSchema.parse(req.body);

  const student = await prisma.student.create({
    data: {
      studentId: data.studentId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender,
      nationality: data.nationality,
      phone: data.phone,
      classId: data.classId,
      parentId: data.parentId
    },
    include: {
      class: true,
      parent: true
    }
  });

  res.status(201).json({
    success: true,
    data: student
  });
}));

// Update student
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = studentSchema.partial().parse(req.body);

  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
    },
    include: {
      class: true,
      parent: true
    }
  });

  res.json({
    success: true,
    data: student
  });
}));

// Delete student
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.student.delete({
    where: { id: req.params.id }
  });

  res.json({
    success: true,
    message: 'Student deleted successfully'
  });
}));

// Get student dashboard
router.get('/:id/dashboard', asyncHandler(async (req: AuthRequest, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      class: true,
      grades: { take: 5 },
      attendances: { take: 10 },
      fees: { take: 5 }
    }
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  res.json({
    success: true,
    data: student
  });
}));

export default router;

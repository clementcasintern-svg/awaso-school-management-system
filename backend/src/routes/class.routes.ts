import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const classSchema = z.object({
  name: z.string().min(2),
  level: z.string(),
  departmentId: z.string(),
  academicYearId: z.string(),
  capacity: z.number().int().positive()
});

// Get all classes
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, departmentId } = req.query;

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        department: true,
        academicYear: true,
        students: { select: { id: true } }
      }
    }),
    prisma.class.count({ where })
  ]);

  res.json({
    success: true,
    data: classes,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get class by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const classData = await prisma.class.findUnique({
    where: { id: req.params.id },
    include: {
      department: true,
      academicYear: true,
      students: true,
      subjects: true
    }
  });

  if (!classData) {
    return res.status(404).json({
      success: false,
      message: 'Class not found'
    });
  }

  res.json({
    success: true,
    data: classData
  });
}));

// Create class
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = classSchema.parse(req.body);

  const classData = await prisma.class.create({
    data,
    include: {
      department: true,
      academicYear: true
    }
  });

  res.status(201).json({
    success: true,
    data: classData
  });
}));

// Update class
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const data = classSchema.partial().parse(req.body);

  const classData = await prisma.class.update({
    where: { id: req.params.id },
    data,
    include: {
      department: true,
      academicYear: true,
      students: true
    }
  });

  res.json({
    success: true,
    data: classData
  });
}));

// Delete class
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  await prisma.class.delete({
    where: { id: req.params.id }
  });

  res.json({
    success: true,
    message: 'Class deleted successfully'
  });
}));

export default router;

import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const attendanceSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  date: z.string().datetime(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  remarks: z.string().optional()
});

// Get all attendance records
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, studentId, classId, date } = req.query;

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (classId) where.classId = classId;
  if (date) {
    const startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date as string);
    endDate.setHours(23, 59, 59, 999);
    where.date = { gte: startDate, lte: endDate };
  }

  const [attendance, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        student: true,
        class: true
      },
      orderBy: { date: 'desc' }
    }),
    prisma.attendance.count({ where })
  ]);

  res.json({
    success: true,
    data: attendance,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Create attendance record
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const data = attendanceSchema.parse(req.body);

  const attendance = await prisma.attendance.create({
    data: {
      ...data,
      date: new Date(data.date)
    },
    include: {
      student: true,
      class: true
    }
  });

  res.status(201).json({
    success: true,
    data: attendance
  });
}));

// Bulk create attendance
router.post('/bulk', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const { records } = req.body;

  const attendance = await prisma.attendance.createMany({
    data: records.map((record: any) => ({
      ...record,
      date: new Date(record.date)
    }))
  });

  res.status(201).json({
    success: true,
    message: `${attendance.count} attendance records created`,
    data: attendance
  });
}));

// Update attendance
router.put('/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'TEACHER']), asyncHandler(async (req: AuthRequest, res) => {
  const data = attendanceSchema.partial().parse(req.body);

  const attendance = await prisma.attendance.update({
    where: { id: req.params.id },
    data,
    include: {
      student: true,
      class: true
    }
  });

  res.json({
    success: true,
    data: attendance
  });
}));

// Get attendance summary
router.get('/summary/:studentId', asyncHandler(async (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const { month, year } = req.query;

  const where: any = { studentId };
  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    where.date = { gte: startDate, lte: endDate };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: { student: true }
  });

  const summary = {
    total: records.length,
    present: records.filter(r => r.status === 'PRESENT').length,
    absent: records.filter(r => r.status === 'ABSENT').length,
    late: records.filter(r => r.status === 'LATE').length,
    excused: records.filter(r => r.status === 'EXCUSED').length,
    percentage: records.length > 0 
      ? ((records.filter(r => r.status === 'PRESENT').length / records.length) * 100).toFixed(2)
      : 0
  };

  res.json({
    success: true,
    data: summary
  });
}));

export default router;

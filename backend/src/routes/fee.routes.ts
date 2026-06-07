import express, { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { authorize, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

const feeSchema = z.object({
  studentId: z.string(),
  amount: z.number().positive(),
  term: z.string(),
  academicYear: z.string(),
  dueDate: z.string().datetime(),
  description: z.string().optional()
});

const paymentSchema = z.object({
  feeId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'CHEQUE', 'BANK_TRANSFER', 'MOBILE_MONEY']),
  reference: z.string(),
  remarks: z.string().optional()
});

// Get all fees
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, studentId, status } = req.query;

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (status) {
    if (status === 'PAID') where.payments = { some: {} };
    if (status === 'UNPAID') where.payments = { none: {} };
  }

  const [fees, total] = await Promise.all([
    prisma.fee.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        student: true,
        payments: true
      }
    }),
    prisma.fee.count({ where })
  ]);

  res.json({
    success: true,
    data: fees,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get fee by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const fee = await prisma.fee.findUnique({
    where: { id: req.params.id },
    include: {
      student: true,
      payments: true
    }
  });

  if (!fee) {
    return res.status(404).json({
      success: false,
      message: 'Fee record not found'
    });
  }

  res.json({
    success: true,
    data: fee
  });
}));

// Create fee
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), asyncHandler(async (req: AuthRequest, res) => {
  const data = feeSchema.parse(req.body);

  const fee = await prisma.fee.create({
    data: {
      ...data,
      dueDate: new Date(data.dueDate)
    },
    include: {
      student: true
    }
  });

  res.status(201).json({
    success: true,
    data: fee
  });
}));

// Record payment
router.post('/pay/:feeId', authorize(['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']), asyncHandler(async (req: AuthRequest, res) => {
  const data = paymentSchema.parse(req.body);

  const payment = await prisma.payment.create({
    data: {
      ...data,
      paymentDate: new Date()
    },
    include: {
      fee: { include: { student: true } }
    }
  });

  res.status(201).json({
    success: true,
    data: payment
  });
}));

// Get student fee status
router.get('/student/:studentId', asyncHandler(async (req: AuthRequest, res) => {
  const { studentId } = req.params;

  const fees = await prisma.fee.findMany({
    where: { studentId },
    include: {
      payments: true
    }
  });

  const totalDue = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.payments.reduce((s, p) => s + p.amount, 0), 0);

  const summary = {
    totalDue,
    totalPaid,
    balance: totalDue - totalPaid,
    fees
  };

  res.json({
    success: true,
    data: summary
  });
}));

export default router;

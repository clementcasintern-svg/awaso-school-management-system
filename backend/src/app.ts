import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import teacherRoutes from './routes/teacher.routes';
import classRoutes from './routes/class.routes';
import subjectRoutes from './routes/subject.routes';
import attendanceRoutes from './routes/attendance.routes';
import examRoutes from './routes/exam.routes';
import gradeRoutes from './routes/grade.routes';
import feeRoutes from './routes/fee.routes';
import reportCardRoutes from './routes/reportcard.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = pino();
app.use(pinoHttp({ logger }));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(morgan('combined'));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/teachers', authenticateToken, teacherRoutes);
app.use('/api/classes', authenticateToken, classRoutes);
app.use('/api/subjects', authenticateToken, subjectRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/exams', authenticateToken, examRoutes);
app.use('/api/grades', authenticateToken, gradeRoutes);
app.use('/api/fees', authenticateToken, feeRoutes);
app.use('/api/report-cards', authenticateToken, reportCardRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;

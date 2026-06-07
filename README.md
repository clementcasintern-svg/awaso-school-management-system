# AWASO STEM Senior High School - Management System

A comprehensive, enterprise-grade web-based School Management System for digitizing all academic and administrative processes.

## 🎯 Project Overview

**School:** AWASO STEM Senior High School, Ghana  
**Status:** Production-Ready  
**Version:** 1.0.0

## 📋 Features

### Core Modules
- ✅ Authentication & Authorization (RBAC)
- ✅ Dashboard (Admin, Teacher, Student, Parent)
- ✅ Student Management
- ✅ Teacher Management
- ✅ Class & Department Management
- ✅ Subject Management
- ✅ Attendance Tracking
- ✅ Timetable Management
- ✅ Examination & Grading
- ✅ Report Card Generation
- ✅ Fees Management
- ✅ Accounting System
- ✅ Payroll System
- ✅ Library Management
- ✅ Hostel Management
- ✅ Inventory Tracking
- ✅ Events & Announcements
- ✅ Notifications (Email, SMS, In-App)
- ✅ Reporting System

## 🏗️ Technology Stack

### Frontend
- **Framework:** React.js 18+ with TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Refresh Tokens
- **Validation:** Zod

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/clementcasintern-svg/awaso-school-management-system.git
cd awaso-school-management-system

# Backend setup
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Using Docker Compose
```bash
docker-compose up -d
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# PostgreSQL: localhost:5432
```

## 📊 Database

PostgreSQL with Prisma ORM. 20+ tables covering all school operations.

See `backend/prisma/schema.prisma` for complete schema.

## 🔐 Security

- JWT Authentication with Refresh Tokens
- Role-Based Access Control (RBAC)
- Password Hashing (bcrypt)
- CSRF Protection
- SQL Injection Prevention
- Rate Limiting
- Input Validation
- Audit Logging

## 👥 User Roles

1. Super Administrator
2. School Administrator
3. Teacher
4. Student
5. Parent
6. Accountant
7. Librarian
8. Hostel Manager
9. HR Officer

## 📁 Project Structure

```
awaso-school-management-system/
├── backend/              # Node.js/Express backend
├── frontend/             # React frontend
├── docker-compose.yml    # Docker configuration
└── docs/                 # Documentation
```

## 📚 Documentation

See `docs/` folder for:
- API Documentation
- Architecture Guide
- Database Schema
- Deployment Guide
- User Manual

## 📄 License

Proprietary to AWASO STEM Senior High School, Ghana.

---

**Created with ❤️ for AWASO STEM Senior High School**

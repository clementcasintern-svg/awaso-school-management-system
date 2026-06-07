// Seed script to initialize the database with default values
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: { name: 'SUPER_ADMIN', description: 'Super Administrator with full access' }
    }),
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'School Administrator' }
    }),
    prisma.role.upsert({
      where: { name: 'TEACHER' },
      update: {},
      create: { name: 'TEACHER', description: 'Teacher' }
    }),
    prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT', description: 'Student' }
    }),
    prisma.role.upsert({
      where: { name: 'PARENT' },
      update: {},
      create: { name: 'PARENT', description: 'Parent/Guardian' }
    }),
    prisma.role.upsert({
      where: { name: 'ACCOUNTANT' },
      update: {},
      create: { name: 'ACCOUNTANT', description: 'Accountant' }
    }),
    prisma.role.upsert({
      where: { name: 'LIBRARIAN' },
      update: {},
      create: { name: 'LIBRARIAN', description: 'Librarian' }
    }),
    prisma.role.upsert({
      where: { name: 'HOSTEL_MANAGER' },
      update: {},
      create: { name: 'HOSTEL_MANAGER', description: 'Hostel Manager' }
    }),
    prisma.role.upsert({
      where: { name: 'HR_OFFICER' },
      update: {},
      create: { name: 'HR_OFFICER', description: 'Human Resource Officer' }
    })
  ]);

  console.log('✅ Roles created');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Science' },
      update: {},
      create: { name: 'Science', code: 'SCI' }
    }),
    prisma.department.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: { name: 'Mathematics', code: 'MATH' }
    }),
    prisma.department.upsert({
      where: { name: 'English' },
      update: {},
      create: { name: 'English', code: 'ENG' }
    }),
    prisma.department.upsert({
      where: { name: 'Social Studies' },
      update: {},
      create: { name: 'Social Studies', code: 'SS' }
    })
  ]);

  console.log('✅ Departments created');

  // Create academic year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024/2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-07-31'),
      isActive: true
    }
  });

  console.log('✅ Academic year created');

  // Create terms
  const terms = await Promise.all([
    prisma.term.create({
      data: {
        name: 'Term 1',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-30'),
        academicYearId: academicYear.id
      }
    }),
    prisma.term.create({
      data: {
        name: 'Term 2',
        startDate: new Date('2025-01-05'),
        endDate: new Date('2025-03-31'),
        academicYearId: academicYear.id
      }
    }),
    prisma.term.create({
      data: {
        name: 'Term 3',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-07-31'),
        academicYearId: academicYear.id
      }
    })
  ]);

  console.log('✅ Terms created');

  // Create classes
  const classForm1 = await prisma.class.create({
    data: {
      name: 'Form 1A',
      level: 'Form 1',
      departmentId: departments[0].id,
      academicYearId: academicYear.id,
      capacity: 40
    }
  });

  console.log('✅ Classes created');

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        code: 'PHY',
        name: 'Physics',
        departmentId: departments[0].id
      }
    }),
    prisma.subject.create({
      data: {
        code: 'CHEM',
        name: 'Chemistry',
        departmentId: departments[0].id
      }
    }),
    prisma.subject.create({
      data: {
        code: 'BIO',
        name: 'Biology',
        departmentId: departments[0].id
      }
    })
  ]);

  console.log('✅ Subjects created');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@awaso.edu.gh',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: roles[0].id
    }
  });

  console.log('✅ Admin user created');
  console.log('\n🎉 Database seeding completed!\n');
  console.log('Default Admin Credentials:');
  console.log('Email: admin@awaso.edu.gh');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

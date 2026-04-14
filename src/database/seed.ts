/**
 * Database Seed Script
 *
 * Populates the DB with initial data for development and testing.
 * Runs outside of NestJS context — uses AppDataSource directly.
 *
 * Usage:
 *   npm run seed
 *
 * Safe to run multiple times — skips records that already exist.
 */

import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import { User } from '../modules/auth/entities/user.entity';
import { Patient } from '../modules/patients/entities/patient.entity';
import { Doctor } from '../modules/doctors/entities/doctor.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../modules/appointments/entities/appointment.entity';
import { MedicalOrder } from '../modules/appointments/entities/medical-order.entity';
import { Role } from '../common/enums/role.enum';

dotenv.config();

// ─── Seed Data ────────────────────────────────────────────────────────────────

const USERS = [
  { email: 'admin@hospital.com', password: 'Admin123!', role: Role.ADMIN },
  { email: 'doctor@hospital.com', password: 'Doctor123!', role: Role.DOCTOR },
  {
    email: 'receptionist@hospital.com',
    password: 'Reception123!',
    role: Role.RECEPTIONIST,
  },
];

const DOCTORS = [
  {
    identification: '9001234567',
    firstName: 'Carlos',
    lastName: 'Ramírez',
    email: 'c.ramirez@hospital.com',
    phone: '3101234567',
    address: 'Cra 50 #20-10',
    city: 'Bogotá',
    professionalCard: 'TP-10234',
    admissionDate: new Date('2018-03-15'),
  },
  {
    identification: '9007654321',
    firstName: 'Laura',
    lastName: 'Mendoza',
    email: 'l.mendoza@hospital.com',
    phone: '3207654321',
    address: 'Calle 80 #45-22',
    city: 'Medellín',
    professionalCard: 'TP-20567',
    admissionDate: new Date('2020-07-01'),
  },
];

const PATIENTS = [
  {
    identification: '1020304050',
    firstName: 'Andrés',
    lastName: 'Torres',
    email: 'andres.torres@email.com',
    phone: '3001112233',
    address: 'Calle 45 #12-34',
    city: 'Bogotá',
  },
  {
    identification: '1030405060',
    firstName: 'María',
    lastName: 'Gómez',
    email: 'maria.gomez@email.com',
    phone: '3154445566',
    address: 'Av. 68 #30-15',
    city: 'Cali',
  },
  {
    identification: '1040506070',
    firstName: 'Jorge',
    lastName: 'Herrera',
    email: 'jorge.herrera@email.com',
    phone: '3009998877',
    address: 'Carrera 15 #90-05',
    city: 'Barranquilla',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function futureDate(daysFromNow: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function log(msg: string) {
  console.log(`  ${msg}`);
}

function skip(msg: string) {
  console.log(`  ⏭  ${msg} (already exists, skipping)`);
}

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedUsers(
  userRepo: import('typeorm').Repository<User>,
): Promise<void> {
  console.log('\n👤 Seeding users...');

  for (const data of USERS) {
    const exists = await userRepo.findOne({ where: { email: data.email } });
    if (exists) {
      skip(`User ${data.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    await userRepo.save(userRepo.create({ ...data, passwordHash }));
    log(
      `✅ Created user [${data.role}]: ${data.email}  →  password: ${data.password}`,
    );
  }
}

async function seedDoctors(
  doctorRepo: import('typeorm').Repository<Doctor>,
): Promise<Doctor[]> {
  console.log('\n🩺 Seeding doctors...');
  const result: Doctor[] = [];

  for (const data of DOCTORS) {
    const exists = await doctorRepo.findOne({
      where: { identification: data.identification },
    });
    if (exists) {
      skip(`Doctor ${data.firstName} ${data.lastName}`);
      result.push(exists);
      continue;
    }

    const doctor = await doctorRepo.save(doctorRepo.create(data));
    result.push(doctor);
    log(
      `✅ Created doctor: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.professionalCard})`,
    );
  }

  return result;
}

async function seedPatients(
  patientRepo: import('typeorm').Repository<Patient>,
): Promise<Patient[]> {
  console.log('\n🧑‍⚕️ Seeding patients...');
  const result: Patient[] = [];

  for (const data of PATIENTS) {
    const exists = await patientRepo.findOne({
      where: { identification: data.identification },
    });
    if (exists) {
      skip(`Patient ${data.firstName} ${data.lastName}`);
      result.push(exists);
      continue;
    }

    const patient = await patientRepo.save(patientRepo.create(data));
    result.push(patient);
    log(`✅ Created patient: ${patient.firstName} ${patient.lastName}`);
  }

  return result;
}

async function seedAppointments(
  appointmentRepo: import('typeorm').Repository<Appointment>,
  orderRepo: import('typeorm').Repository<MedicalOrder>,
  doctors: Doctor[],
  patients: Patient[],
): Promise<void> {
  console.log('\n📅 Seeding appointments...');

  const appointmentsData = [
    {
      doctor: doctors[0],
      patient: patients[0],
      appointmentDate: futureDate(3, 9),
      status: AppointmentStatus.PROGRAMADA,
    },
    {
      doctor: doctors[0],
      patient: patients[1],
      appointmentDate: futureDate(3, 11),
      status: AppointmentStatus.PROGRAMADA,
    },
    {
      doctor: doctors[1],
      patient: patients[2],
      appointmentDate: futureDate(5, 14),
      status: AppointmentStatus.PROGRAMADA,
    },
    // Past appointment with ASISTIO status + medical order
    {
      doctor: doctors[1],
      patient: patients[0],
      appointmentDate: futureDate(-7, 10),
      status: AppointmentStatus.ASISTIO,
      statusUpdatedAt: futureDate(-7, 11),
    },
  ];

  for (const data of appointmentsData) {
    const exists = await appointmentRepo.findOne({
      where: {
        doctor: { id: data.doctor.id },
        patient: { id: data.patient.id },
        appointmentDate: data.appointmentDate,
      },
    });

    if (exists) {
      skip(
        `Appointment ${data.doctor.firstName} ↔ ${data.patient.firstName} @ ${data.appointmentDate.toISOString()}`,
      );
      continue;
    }

    const appointment = await appointmentRepo.save(
      appointmentRepo.create({
        doctor: data.doctor,
        patient: data.patient,
        appointmentDate: data.appointmentDate,
        status: data.status,
        statusUpdatedAt:
          (data as { statusUpdatedAt?: Date }).statusUpdatedAt ?? null,
      }),
    );

    log(
      `✅ Created appointment: Dr. ${data.doctor.lastName} ↔ ${data.patient.firstName} — ${data.status} — ${data.appointmentDate.toLocaleDateString()}`,
    );

    // Add a medical order to the completed appointment
    if (data.status === AppointmentStatus.ASISTIO) {
      await orderRepo.save(
        orderRepo.create({
          appointment,
          description: 'Complete blood count, liver panel and lipid profile',
          expirationDate: futureDate(30),
          specialty: 'Internal Medicine',
        }),
      );
      log(`   📋 Added medical order to appointment`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  const databaseLabel = databaseUrl
    ? (() => {
        try {
          const parsed = new URL(databaseUrl);
          return `${parsed.pathname.replace(/^\//, '') || 'unknown_db'} @ ${parsed.hostname}`;
        } catch {
          return 'invalid DATABASE_URL';
        }
      })()
    : 'DATABASE_URL not set';

  console.log('🌱 Starting database seed...');
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   Database:    ${databaseLabel}`);

  await AppDataSource.initialize();
  console.log('   Connected to database ✓');

  // Create tables if they don't exist yet (safe for dev — no data loss).
  // In production the tables are created by migrations instead.
  await AppDataSource.synchronize();
  console.log('   Schema synchronized ✓');

  const userRepo = AppDataSource.getRepository(User);
  const doctorRepo = AppDataSource.getRepository(Doctor);
  const patientRepo = AppDataSource.getRepository(Patient);
  const appointmentRepo = AppDataSource.getRepository(Appointment);
  const orderRepo = AppDataSource.getRepository(MedicalOrder);

  await seedUsers(userRepo);
  const doctors = await seedDoctors(doctorRepo);
  const patients = await seedPatients(patientRepo);
  await seedAppointments(appointmentRepo, orderRepo, doctors, patients);

  await AppDataSource.destroy();

  console.log('\n✅ Seed completed successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Test credentials:');
  console.log('  ADMIN        → admin@hospital.com        / Admin123!');
  console.log('  DOCTOR       → doctor@hospital.com       / Doctor123!');
  console.log('  RECEPTIONIST → receptionist@hospital.com / Reception123!');
  console.log('─────────────────────────────────────────\n');
}

main().catch((err: unknown) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});

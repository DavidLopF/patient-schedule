import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { MedicalOrder } from './medical-order.entity';

export enum AppointmentStatus {
  PROGRAMADA = 'PROGRAMADA',
  ASISTIO = 'ASISTIO',
  NO_ASISTIO = 'NO_ASISTIO',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, { eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Index()
  @Column({ type: 'timestamptz' })
  appointmentDate: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PROGRAMADA })
  status: AppointmentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  statusUpdatedAt: Date | null;

  @OneToMany(() => MedicalOrder, (order) => order.appointment, { cascade: true })
  medicalOrders: MedicalOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

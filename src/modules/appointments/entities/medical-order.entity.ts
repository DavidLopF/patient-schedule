import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('medical_orders')
export class MedicalOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.medicalOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ length: 100 })
  specialty: string;

  @CreateDateColumn()
  createdAt: Date;
}

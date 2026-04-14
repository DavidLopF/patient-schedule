import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 20 })
  identification: string;

  @Column({ length: 90 })
  firstName: string;

  @Column({ length: 90 })
  lastName: string;

  @Index({ unique: true })
  @Column({ length: 200 })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 200 })
  address: string;

  @Column({ length: 90 })
  city: string;

  @Column({ length: 50 })
  professionalCard: string;

  @Column({ type: 'date' })
  admissionDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

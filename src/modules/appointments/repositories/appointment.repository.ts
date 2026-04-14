import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { MedicalOrder } from '../entities/medical-order.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Injectable()
export class AppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    @InjectRepository(MedicalOrder)
    private readonly orderRepo: Repository<MedicalOrder>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    private readonly dataSource: DataSource,
  ) {}

  async createWithLock(
    doctorId: string,
    patientId: string,
    appointmentDate: Date,
  ): Promise<Appointment> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // Pessimistic write lock on doctor to prevent double booking
      const doctor = await manager.findOne(Doctor, {
        where: { id: doctorId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!doctor) {
        throw new Error(`Doctor with ID ${doctorId} not found`);
      }

      // Check existing appointment for same doctor & exact datetime
      const conflict = await manager.findOne(Appointment, {
        where: {
          doctor: { id: doctorId },
          appointmentDate,
          status: AppointmentStatus.PROGRAMADA,
        },
      });

      if (conflict) {
        throw new Error('Doctor already has an appointment at this time');
      }

      const appointment = manager.create(Appointment, {
        doctor: { id: doctorId },
        patient: { id: patientId },
        appointmentDate,
        status: AppointmentStatus.PROGRAMADA,
      });

      return manager.save(Appointment, appointment);
    });
  }

  async findAll(page: number, limit: number): Promise<[Appointment[], number]> {
    return this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { appointmentDate: 'DESC' },
      relations: ['doctor', 'patient', 'medicalOrders'],
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'medicalOrders'],
    });
  }

  async findByPatientIdentification(
    identification: string,
  ): Promise<Appointment[]> {
    return this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.doctor', 'doctor')
      .leftJoinAndSelect('a.patient', 'patient')
      .leftJoinAndSelect('a.medicalOrders', 'orders')
      .where('patient.identification = :identification', { identification })
      .orderBy('a.appointmentDate', 'DESC')
      .getMany();
  }

  async findByDate(date: string): Promise<Appointment[]> {
    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(`${date}T23:59:59Z`);

    return this.repo.find({
      where: { appointmentDate: Between(start, end) },
      relations: ['doctor', 'patient', 'medicalOrders'],
      order: { appointmentDate: 'ASC' },
    });
  }

  async findAvailableDoctors(appointmentDate: Date): Promise<Doctor[]> {
    // Get IDs of doctors who already have a PROGRAMADA appointment at this exact time
    const busyDoctors = await this.repo
      .createQueryBuilder('a')
      .select('a.doctor_id', 'doctorId')
      .where('a.appointmentDate = :appointmentDate', { appointmentDate })
      .andWhere('a.status = :status', { status: AppointmentStatus.PROGRAMADA })
      .getRawMany<{ doctorId: string }>();

    const busyDoctorIds = busyDoctors.map((r) => r.doctorId);

    if (busyDoctorIds.length === 0) {
      return this.doctorRepo.find({ order: { firstName: 'ASC' } });
    }

    return this.doctorRepo
      .createQueryBuilder('d')
      .where('d.id NOT IN (:...ids)', { ids: busyDoctorIds })
      .orderBy('d.firstName', 'ASC')
      .getMany();
  }

  async save(appointment: Appointment): Promise<Appointment> {
    return this.repo.save(appointment);
  }

  async addMedicalOrder(
    appointment: Appointment,
    orderData: Partial<MedicalOrder>,
  ): Promise<MedicalOrder> {
    const order = this.orderRepo.create({ ...orderData, appointment });
    return this.orderRepo.save(order);
  }

  async remove(appointment: Appointment): Promise<void> {
    await this.repo.remove(appointment);
  }
}

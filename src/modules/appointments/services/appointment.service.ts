import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { PatientService } from '../../patients/services/patient.service';
import { DoctorService } from '../../doctors/services/doctor.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { CreateMedicalOrderDto } from '../dto/create-medical-order.dto';
import { AvailableDoctorsQueryDto } from '../dto/available-doctors-query.dto';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { MedicalOrder } from '../entities/medical-order.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    // Validate patient and doctor exist
    await this.patientService.findOne(dto.patientId);
    await this.doctorService.findOne(dto.doctorId);

    const appointmentDate = new Date(dto.appointmentDate);

    if (appointmentDate <= new Date()) {
      throw new BadRequestException('Appointment date must be in the future');
    }

    try {
      const appointment = await this.appointmentRepository.createWithLock(
        dto.doctorId,
        dto.patientId,
        appointmentDate,
      );

      return this.findOne(appointment.id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already has an appointment')) {
        throw new ConflictException(
          'Doctor already has an appointment at this time. Please choose a different time or doctor.',
        );
      }
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async findAll(pagination: PaginationDto): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = pagination;
    const [data, total] = await this.appointmentRepository.findAll(page, limit);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async findByPatientIdentification(identification: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByPatientIdentification(identification);
  }

  async findByDate(date: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByDate(date);
  }

  async getAvailableDoctors(query: AvailableDoctorsQueryDto): Promise<Doctor[]> {
    const appointmentDate = new Date(query.date);
    return this.appointmentRepository.findAvailableDoctors(appointmentDate);
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    currentUser: JwtPayload,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Only the assigned doctor or admin can change status
    if (currentUser.role === Role.DOCTOR) {
      if (appointment.doctor.id !== currentUser.sub) {
        throw new ForbiddenException('You can only update status for your own appointments');
      }
    }

    if (dto.status === AppointmentStatus.PROGRAMADA) {
      throw new BadRequestException('Cannot revert status back to PROGRAMADA');
    }

    appointment.status = dto.status;
    appointment.statusUpdatedAt = new Date();

    return this.appointmentRepository.save(appointment);
  }

  async addMedicalOrder(
    appointmentId: string,
    dto: CreateMedicalOrderDto,
    currentUser: JwtPayload,
  ): Promise<MedicalOrder> {
    const appointment = await this.findOne(appointmentId);

    // Only the assigned doctor or admin can add orders
    if (currentUser.role === Role.DOCTOR) {
      if (appointment.doctor.id !== currentUser.sub) {
        throw new ForbiddenException('You can only add medical orders to your own appointments');
      }
    }

    return this.appointmentRepository.addMedicalOrder(appointment, {
      description: dto.description,
      expirationDate: new Date(dto.expirationDate),
      specialty: dto.specialty,
    });
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }
}

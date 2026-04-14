import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DoctorRepository } from '../repositories/doctor.repository';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../dto/update-doctor.dto';
import { Doctor } from '../entities/doctor.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async create(dto: CreateDoctorDto): Promise<Doctor> {
    const existing = await this.doctorRepository.findByIdentification(dto.identification);
    if (existing) {
      throw new ConflictException(
        `Doctor with identification ${dto.identification} already exists`,
      );
    }

    const doctor = this.doctorRepository.create(dto);
    return this.doctorRepository.save(doctor);
  }

  async findAll(pagination: PaginationDto): Promise<{ data: Doctor[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = pagination;
    const [data, total] = await this.doctorRepository.findAll(page, limit);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async findByIdentification(identification: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findByIdentification(identification);
    if (!doctor) {
      throw new NotFoundException(`Doctor with identification ${identification} not found`);
    }
    return doctor;
  }

  async update(id: string, dto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    return this.doctorRepository.update(doctor, dto);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorRepository.remove(doctor);
  }
}

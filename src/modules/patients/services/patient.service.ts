import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PatientRepository } from '../repositories/patient.repository';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { Patient } from '../entities/patient.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async create(dto: CreatePatientDto): Promise<Patient> {
    // Idempotency: check by identification (natural unique key)
    const existing = await this.patientRepository.findByIdentification(dto.identification);
    if (existing) {
      throw new ConflictException(
        `Patient with identification ${dto.identification} already exists`,
      );
    }

    const patient = this.patientRepository.create(dto);
    return this.patientRepository.save(patient);
  }

  async findAll(pagination: PaginationDto): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = pagination;
    const [data, total] = await this.patientRepository.findAll(page, limit);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async findByIdentification(identification: string): Promise<Patient> {
    const patient = await this.patientRepository.findByIdentification(identification);
    if (!patient) {
      throw new NotFoundException(`Patient with identification ${identification} not found`);
    }
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    return this.patientRepository.update(patient, dto);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }
}

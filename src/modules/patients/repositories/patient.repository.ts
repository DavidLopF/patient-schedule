import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';

@Injectable()
export class PatientRepository {
  constructor(
    @InjectRepository(Patient)
    private readonly repo: Repository<Patient>,
  ) {}

  create(dto: CreatePatientDto): Patient {
    return this.repo.create(dto);
  }

  async save(patient: Patient): Promise<Patient> {
    return this.repo.save(patient);
  }

  async findAll(page: number, limit: number): Promise<[Patient[], number]> {
    return this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Patient | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdentification(identification: string): Promise<Patient | null> {
    return this.repo.findOne({ where: { identification } });
  }

  async update(patient: Patient, dto: UpdatePatientDto): Promise<Patient> {
    Object.assign(patient, dto);
    return this.repo.save(patient);
  }

  async remove(patient: Patient): Promise<void> {
    await this.repo.remove(patient);
  }
}

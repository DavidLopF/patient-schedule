import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../dto/update-doctor.dto';

@Injectable()
export class DoctorRepository {
  constructor(
    @InjectRepository(Doctor)
    private readonly repo: Repository<Doctor>,
  ) {}

  create(dto: CreateDoctorDto): Doctor {
    return this.repo.create(dto);
  }

  async save(doctor: Doctor): Promise<Doctor> {
    return this.repo.save(doctor);
  }

  async findAll(page: number, limit: number): Promise<[Doctor[], number]> {
    return this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Doctor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdentification(identification: string): Promise<Doctor | null> {
    return this.repo.findOne({ where: { identification } });
  }

  async update(doctor: Doctor, dto: UpdateDoctorDto): Promise<Doctor> {
    Object.assign(doctor, dto);
    return this.repo.save(doctor);
  }

  async remove(doctor: Doctor): Promise<void> {
    await this.repo.remove(doctor);
  }
}

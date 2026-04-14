import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientRepository } from '../repositories/patient.repository';
import { Patient } from '../entities/patient.entity';

const mockPatient = (): Patient => ({
  id: 'uuid-1',
  identification: '1234567890',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  phone: '3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockPatientRepository = () => ({
  findByIdentification: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('PatientService', () => {
  let service: PatientService;
  let repository: ReturnType<typeof mockPatientRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        { provide: PatientRepository, useFactory: mockPatientRepository },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    repository = module.get(PatientRepository);
  });

  describe('create', () => {
    it('should create a patient successfully', async () => {
      repository.findByIdentification.mockResolvedValue(null);
      repository.create.mockReturnValue(mockPatient());
      repository.save.mockResolvedValue(mockPatient());

      const result = await service.create({
        identification: '1234567890',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '3001234567',
        address: 'Calle 123',
        city: 'Bogotá',
      });

      expect(result).toEqual(mockPatient());
      expect(repository.findByIdentification).toHaveBeenCalledWith('1234567890');
    });

    it('should throw ConflictException when patient already exists', async () => {
      repository.findByIdentification.mockResolvedValue(mockPatient());

      await expect(
        service.create({
          identification: '1234567890',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '3001234567',
          address: 'Calle 123',
          city: 'Bogotá',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      repository.findById.mockResolvedValue(mockPatient());
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(mockPatient());
    });

    it('should throw NotFoundException when patient not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated patients', async () => {
      repository.findAll.mockResolvedValue([[mockPatient()], 1]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update patient successfully', async () => {
      const updated = { ...mockPatient(), firstName: 'Jane' };
      repository.findById.mockResolvedValue(mockPatient());
      repository.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { firstName: 'Jane' });
      expect(result.firstName).toBe('Jane');
    });

    it('should throw NotFoundException on update of non-existent patient', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.update('non-existent', { firstName: 'Jane' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete patient successfully', async () => {
      repository.findById.mockResolvedValue(mockPatient());
      repository.remove.mockResolvedValue(undefined);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException on remove of non-existent patient', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});

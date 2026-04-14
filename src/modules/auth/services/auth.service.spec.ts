import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Role } from '../../../common/enums/role.enum';

const mockUser = (): User => ({
  id: 'uuid-user-1',
  email: 'admin@hospital.com',
  passwordHash: bcrypt.hashSync('SecurePass123!', 10),
  role: Role.ADMIN,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: ReturnType<typeof mockUserRepository>;
  let jwtService: ReturnType<typeof mockJwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser());
      userRepository.save.mockResolvedValue(mockUser());

      const result = await service.register({
        email: 'admin@hospital.com',
        password: 'SecurePass123!',
        role: Role.ADMIN,
      });

      expect(result).toHaveProperty('accessToken');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());

      await expect(
        service.register({ email: 'admin@hospital.com', password: 'SecurePass123!', role: Role.ADMIN }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token with valid credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());

      const result = await service.login({
        email: 'admin@hospital.com',
        password: 'SecurePass123!',
      });

      expect(result).toHaveProperty('accessToken', 'mock.jwt.token');
    });

    it('should throw UnauthorizedException with wrong password', async () => {
      userRepository.findOne.mockResolvedValue(mockUser());

      await expect(
        service.login({ email: 'admin@hospital.com', password: 'WrongPass!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@hospital.com', password: 'AnyPass123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

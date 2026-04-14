import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

const mockExecutionContext = (user: { role: Role } | null, roles: Role[] | null) => {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
};

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const ctx = mockExecutionContext({ role: Role.RECEPTIONIST }, null);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user has the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const ctx = mockExecutionContext({ role: Role.ADMIN }, [Role.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny access when user does not have the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const ctx = mockExecutionContext({ role: Role.RECEPTIONIST }, [Role.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should allow DOCTOR when multiple roles are required and DOCTOR is included', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.DOCTOR]);
    const ctx = mockExecutionContext({ role: Role.DOCTOR }, [Role.ADMIN, Role.DOCTOR]);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from 'typeorm';
// import { RoleGuard } from './role.guard';
import { UserRoleEnum } from '../enums/user-role.enum';
import { User } from '../../auth/entities/auth.entity';
import { RoleGuard } from './authorization.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflectorMock: jest.Mocked<Reflector>;
  let entityManagerMock: jest.Mocked<EntityManager>;

  beforeEach(() => {
    reflectorMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    entityManagerMock = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;
    guard = new RoleGuard(reflectorMock, entityManagerMock);
  });

  it('should allow access if no roles are defined', async () => {
    reflectorMock.get.mockReturnValueOnce(undefined);
    const contextMock = {getHandler() {
        
    },} as ExecutionContext;

    const result = await guard.canActivate(contextMock);

    expect(result).toBe(true);
  });

  it('should allow access if user has required role', async () => {
    const roles = [UserRoleEnum.ADMIN];
    reflectorMock.get.mockReturnValueOnce(roles);
    const contextMock = {
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValueOnce({
          user: { sub: '1' }, // Mock user payload with required role
        }),
      }),
      getHandler: () => {}
    } as unknown as ExecutionContext;
    entityManagerMock.findOne.mockResolvedValueOnce({ id: '1', role: UserRoleEnum.ADMIN } as unknown as User);

    const result = await guard.canActivate(contextMock);

    expect(result).toBe(true);
  });

  it('should deny access if user does not have required role', async () => {
    const roles = [UserRoleEnum.ADMIN];
    reflectorMock.get.mockReturnValueOnce(roles);
    const contextMock = {
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValueOnce({
          user: { sub: '1' }, // Mock user payload without required role
        }),
      }),
      getHandler: () => {}
    } as unknown as ExecutionContext;
    entityManagerMock.findOne.mockResolvedValueOnce(null); // Simulate user not found

    const result = await guard.canActivate(contextMock);

    expect(result).toBe(false);
  });
});
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager, In } from 'typeorm';
import { UserRoleEnum } from '../enums/user-role.enum';
import { User } from '../../auth/entities/auth.entity';
import { ROLE_KEY } from '../../auth/decorators/role';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<UserRoleEnum[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    if (!roles || !roles.length) {
      return true;
    }

    // if we want to make the role to be number instead, we need to map it
    // const rolesArray: number[] = roles.map(role => RolesEnum[role]);

    // get request context
    const request = context.switchToHttp().getRequest();
    // since we already had the jwt access token guard, when having that guard, we actually attach the payload which contains the role into the request.user
    const { sub } = request.user;
    const result = await this.em.findOne(User, {
      where: {
        id: sub,
        role: In(roles),
      },
    });

    if (!result) {
      return false;
    }

    return true;
  }
}

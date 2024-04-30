import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from 'src/utils/enums/user-role.enum';

export const ROLE_KEY = 'roles';
export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(ROLE_KEY, roles);

import { AuthStrategyEnum } from '../enums/auth-strategy.enum';
import { UserRoleEnum } from '../enums/user-role.enum';

export interface IUserPayload {
  sub: number;
  email: string;
  role: UserRoleEnum;
  authStrategy: AuthStrategyEnum;
  iat: number;
  exp: number;
}

import { UserRoleEnum } from '../../utils/enums/user-role.enum';
import { AuthStrategyEnum } from '../../utils/enums/auth-strategy.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
    length: 255,
    nullable: false,
    name: 'email',
  })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'password' })
  password: string;

  @Column({
    type: 'enum',
    enum: AuthStrategyEnum,
    default: AuthStrategyEnum.SYSTEM,
    name: 'auth_strategy',
  })
  authStrategy: AuthStrategyEnum = AuthStrategyEnum.SYSTEM;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER,
    name: 'role',
  })
  role: UserRoleEnum = UserRoleEnum.USER;
}

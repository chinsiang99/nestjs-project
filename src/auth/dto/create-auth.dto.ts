import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IsPasswordMatching } from 'src/utils/dto-decorator/is-password-matching.decorator';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
    },
  )
  // equivalent to below
  // @MinLength(8)
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.' })
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsPasswordMatching('password')
  confirmPassword: string;
}

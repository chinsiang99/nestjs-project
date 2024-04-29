import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  register(registerDto: RegisterDto) {
    const {} = registerDto;
    return 'This action adds a new auth';
  }
}

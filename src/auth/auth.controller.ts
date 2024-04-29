import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  BaseResponse,
  IBaseResponse,
} from '../utils/response-interface/base-response.interface';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'User register an account' })
  @ApiCreatedResponse({
    type: BaseResponse,
    description: 'User successfully registered an account',
  })
  @ApiBadRequestResponse({ description: 'Bad request error' })
  async register(@Body() registerDto: RegisterDto): Promise<IBaseResponse> {
    await this.authService.register(registerDto);
    return { status: HttpStatus.CREATED, message: 'Successfully registered' };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login an account' })
  @ApiCreatedResponse({
    type: BaseResponse,
    description: 'User successfully longin an account',
  })
  @ApiBadRequestResponse({ description: 'Bad request error' })
  async login(@Body() loginDto: LoginDto): Promise<IBaseResponse> {
    const token = await this.authService.login(loginDto);
    return {
      status: HttpStatus.CREATED,
      message: 'Successfully login',
      data: token,
    };
  }
}

import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  BaseResponse,
  IBaseResponse,
} from '../utils/response-interface/base-response.interface';
import { LoginDto } from './dto/login.dto';
import {
  ILoginResponse,
  LoginResponse,
} from 'src/utils/response-interface/login-response.interface';

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
  @ApiOperation({ summary: 'User log in an account' })
  @ApiOkResponse({
    type: LoginResponse,
    description: 'User successfully long in an account',
  })
  @ApiBadRequestResponse({ description: 'Bad request error' })
  async login(@Body() loginDto: LoginDto): Promise<ILoginResponse> {
    const token = await this.authService.login(loginDto);
    return {
      status: HttpStatus.CREATED,
      message: 'Successfully log in',
      data: token,
    };
  }
}

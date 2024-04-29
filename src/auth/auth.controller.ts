import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BaseResponse } from '../utils/response-interface/base-response.interface';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'User register an account' })
  @ApiCreatedResponse({
    type: BaseResponse,
    description: 'user successfully registered an account',
  })
  @ApiBadRequestResponse({ description: 'Bad request error' })
  async register(@Body() registerDto: RegisterDto): Promise<BaseResponse> {
    await this.authService.register(registerDto);
    return { status: HttpStatus.CREATED, message: 'Successfully registered' };
  }
}

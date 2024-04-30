import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  UseGuards,
} from '@nestjs/common';
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
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenGuard } from 'src/utils/guards/access-token.guard';
import { Roles } from './decorators/role';
import { UserRoleEnum } from 'src/utils/enums/user-role.enum';
import { RoleGuard } from 'src/utils/guards/authorization.guard';
import { User } from 'src/utils/decorators/user-decorator';
import { IUserPayload } from 'src/utils/interfaces/user-payload.interface';

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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User log in an account' })
  @ApiOkResponse({
    type: LoginResponse,
    description: 'User successfully long in an account',
  })
  @ApiBadRequestResponse({ description: 'Bad request error' })
  async login(@Body() loginDto: LoginDto): Promise<ILoginResponse> {
    const token = await this.authService.login(loginDto);
    return {
      status: HttpStatus.OK,
      message: 'Successfully log in',
      data: token,
    };
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.USER)
  @Get('refresh-token')
  @ApiOperation({ summary: 'Get refresh token' })
  @ApiOkResponse({
    type: LoginResponse,
    description: 'Successfully get refresh token',
  })
  @ApiBadRequestResponse({ description: 'Bad request error' })
  async getRefreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @User() user: IUserPayload,
  ): Promise<ILoginResponse> {
    const token = await this.authService.getRefreshToken(refreshTokenDto, user);
    return {
      status: HttpStatus.OK,
      message: 'Successfully refresh token',
      data: token,
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import { HttpStatus } from '@nestjs/common';
import { IJwtToken } from '../utils/interfaces/jwt-token.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EntityManager } from 'typeorm';
import { IUserPayload } from '../utils/interfaces/user-payload.interface';
import { AuthStrategyEnum } from '../utils/enums/auth-strategy.enum';
import { UserRoleEnum } from '../utils/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;

  const dummyRegisterDto : RegisterDto = {
    email: 'email@gmail.com',
    password: 'Email123!',
    confirmPassword: 'Email123!'
  }

  const dummyJwtToken: IJwtToken = {
    accessToken: 'dummy access token',
    refreshToken: 'dummy refresh token'
  }

  const dummyLoginDto: LoginDto = {
    email: 'dummyEmail@gmail.com',
    password: 'dummyEmail99!'
  }

  const dummyRefreshTokenDto: RefreshTokenDto = {
    refreshToken: 'dummy refresh token'
  }

  const dummyUserPayload: IUserPayload = {
    sub: 1,
    email: 'chinsiang9@gmail.com',
    role: UserRoleEnum.USER,
    authStrategy: AuthStrategyEnum.SYSTEM,
    iat: 1,
    exp: 1,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [ 
        {
          provide: AuthService,
          useFactory: jest.fn(()=>({
            register: jest.fn().mockResolvedValue(true),
            login: jest.fn().mockResolvedValue(dummyJwtToken),
            getRefreshToken: jest.fn().mockResolvedValue(dummyJwtToken)
          }))
        },
        {
          provide: EntityManager,
          useFactory: jest.fn(() => ({

          }))
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST auth/register', ()=>{
    it("should successfully resolve", async()=>{
      const result = await controller.register(dummyRegisterDto)
      expect(result.status).toStrictEqual(HttpStatus.CREATED)
      expect(result.message).toStrictEqual('Successfully registered')
    })
  })

  describe('POST auth/login', ()=>{
    it("should successfully resolve", async()=>{
      const result = await controller.login(dummyLoginDto)
      expect(result.status).toStrictEqual(HttpStatus.OK)
      expect(result.data).toMatchObject(dummyJwtToken)
      expect(result.message).toStrictEqual('Successfully log in')
    })
  })

  describe('GET auth/refresh-token', ()=>{
    it("should successfully resolve", async()=>{
      const result = await controller.getRefreshToken(dummyRefreshTokenDto, dummyUserPayload)
      expect(result.status).toStrictEqual(HttpStatus.OK)
      expect(result.data).toMatchObject(dummyJwtToken)
      expect(result.message).toStrictEqual('Successfully refresh token')
    })
  })
});

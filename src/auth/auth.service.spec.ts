import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterDto } from './dto/create-auth.dto';
import { IJwtToken } from 'src/utils/interfaces/jwt-token.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'; // Import bcryptjs as default
import { UserRoleEnum } from 'src/utils/enums/user-role.enum';
import { AuthStrategyEnum } from 'src/utils/enums/auth-strategy.enum';
import { IUserPayload } from 'src/utils/interfaces/user-payload.interface';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let jwtService: JwtService;

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
      providers: [
        AuthService, 
        JwtService,
        {
          provide: ConfigService,
          useFactory: jest.fn(() => ({
            getOrThrow: jest.fn((key: string) => {
              if (key === 'NODE_ENV') return 'test';
              if (key === 'LOG_LEVEL') return 'info'; // Mock log level for testing
              throw new Error(`Key ${key} not found`);
            }),
            get: jest.fn().mockResolvedValue(true)
          }))
        },
        {
          provide: getRepositoryToken(User),
          useFactory: jest.fn(()=>({

          }))
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('function register', ()=>{
    it("should successfully resolve", async()=>{
      userRepository.findOne = jest.fn().mockResolvedValueOnce(false)
      userRepository.save = jest.fn().mockResolvedValueOnce(true)
      const result = await service.register(dummyRegisterDto)
      expect(result).resolves
    })

    it("should throw bad request exception if the email already been registered", async()=>{
      const email = 'email@gmail.com'
      userRepository.findOne = jest.fn().mockResolvedValueOnce({
        email
      })
      userRepository.save = jest.fn().mockResolvedValueOnce(true)
      try{
        await service.register(dummyRegisterDto)
      }catch(error){
        expect(error).toBeInstanceOf(BadRequestException)
        expect(error.message).toStrictEqual(`User with email ${email} already been registered`)
      }
    })
  })

  describe('function login', ()=>{
    it("should successfully resolve", async()=>{
      // Mock compareSync function to return true
      jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(true);
      service.generateToken = jest.fn().mockResolvedValueOnce(dummyJwtToken)
      userRepository.findOne = jest.fn().mockResolvedValueOnce({
        password: 'dummy password'
      })
      const result = await service.login(dummyLoginDto)
      expect(result).toMatchObject(dummyJwtToken)
    })

    it("should throw not found exception if the email is not found or registered", async()=>{
      userRepository.findOne = jest.fn().mockResolvedValueOnce(false)
      try{
        await service.login(dummyLoginDto)
      }catch(error){
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toStrictEqual(`User with email ${dummyLoginDto.email} not found`)
      }
    })

    it("should throw not found exception if the email is not found or registered", async()=>{
      userRepository.findOne = jest.fn().mockResolvedValueOnce(false)
      try{
        await service.login(dummyLoginDto)
      }catch(error){
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.message).toStrictEqual(`User with email ${dummyLoginDto.email} not found`)
      }
    })

    it("should throw unauthorized exception if the credentials do not match", async()=>{
      userRepository.findOne = jest.fn().mockResolvedValueOnce({
        password: "dummy password"
      })
      jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(false)
      try{
        await service.login(dummyLoginDto)
      }catch(error){
        expect(error).toBeInstanceOf(UnauthorizedException)
        expect(error.message).toStrictEqual(`Invalid credentials`)
      }
    })

    it("should throw internal server error exception if unable to generate token", async()=>{
      userRepository.findOne = jest.fn().mockResolvedValueOnce({
        password: "dummy password"
      })
      jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(true)
      service.generateToken = jest.fn().mockRejectedValueOnce(Error("any error"))
      try{
        await service.login(dummyLoginDto)
      }catch(error){
        expect(error).toBeInstanceOf(InternalServerErrorException)
        expect(error.message).toStrictEqual(`There is a problem while generating the token`)
      }
    })
  })

  describe('function getRefreshToken', () => {
    it("should successfully resolve", async()=>{
      jwtService.verifyAsync = jest.fn().mockResolvedValueOnce({sub: 1})
      service.generateToken = jest.fn().mockResolvedValueOnce(dummyJwtToken)
      userRepository.findOne = jest.fn().mockResolvedValueOnce({id: 1})
      const result = await service.getRefreshToken(dummyRefreshTokenDto, dummyUserPayload)
      expect(result).toMatchObject(dummyJwtToken)
    })

    it("should throw unauthorized exception if there is any error occur in getting refresh token", async()=>{
      jwtService.verifyAsync = jest.fn().mockResolvedValueOnce(Error('any other error'))
      try{
        await service.getRefreshToken(dummyRefreshTokenDto, dummyUserPayload)
      }catch(error){
        expect(error).toBeInstanceOf(UnauthorizedException)
        expect(error.message).toStrictEqual('Invalid credentials')
      }
    })
  })

  describe('function hashPassword', ()=>{
    it('should successfully resolve and return hashed password', ()=>{
      const dummyPassword = 'hello'
      const hashedPassword = bcrypt.hashSync(dummyPassword, 10)
      const result = service.hashPassword(dummyPassword)
      expect(result.substring(0, 7)).toStrictEqual(hashedPassword.substring(0, 7))
    })
  })

  describe('function generateToken', ()=>{
    it('should successfully resolve and generate token', async() =>{
      const user = {
        id: 1,
        email: "email@gmail.com",
        role: UserRoleEnum.ADMIN,
        authStrategy: AuthStrategyEnum.SYSTEM
      } as User

      jwtService.signAsync = jest.fn().mockResolvedValueOnce(dummyJwtToken.accessToken)
                                      .mockResolvedValueOnce(dummyJwtToken.refreshToken)
      const result = await service.generateToken(user)
      expect(result).toMatchObject(dummyJwtToken)
    })
  })
});

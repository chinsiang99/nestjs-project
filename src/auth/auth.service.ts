import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { compareSync, hashSync } from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtToken } from '../utils/interfaces/jwt-token.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>, //
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user.
   *
   * @param {RegisterDto} registerDto - The data for registering a new user.
   * @returns {Promise<void | HttpException>} A promise that resolves when the user is registered successfully, or rejects with an HttpException if an error occurs.
   * @throws {HttpException} Throws a BadRequestException if the user with the provided email already exists.
   */
  async register(registerDto: RegisterDto): Promise<void | HttpException> {
    const { email, password } = registerDto;
    const existingUser = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        `User with email ${email} already been registered`,
      );
    }

    const hashedPassword = this.hashPassword(password);

    await this.userRepository.save({
      email,
      password: hashedPassword,
    });
  }

  /**
   * Logs in a user using the provided login credentials.
   *
   * @param {LoginDto} loginDto - The data containing the email and password for logging in.
   * @returns {Promise<IJwtToken>} A promise that resolves with the JWT tokens upon successful login.
   * @throws {NotFoundException} Thrown if the user with the provided email does not exist.
   * @throws {UnauthorizedException} Thrown if the provided password is invalid.
   * @throws {InternalServerErrorException} Thrown if there is a problem while generating the token.
   */
  async login(loginDto: LoginDto): Promise<IJwtToken> {
    const { email, password } = loginDto;

    const existingUser = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const isValidpassword = compareSync(password, existingUser.password);

    if (!isValidpassword) {
      throw new UnauthorizedException(`Invalid credentials`);
    }

    try {
      return await this.generateToken(existingUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'There is a problem while generating the token',
      );
    }
  }

  /**
   * Retrieves a new pair of JWT tokens using the provided refresh token.
   *
   * @param {RefreshTokenDto} refreshtokenDto - The data containing the refresh token.
   * @returns {Promise<IJwtToken>} A promise that resolves with the new JWT tokens upon successful verification of the refresh token.
   * @throws {UnauthorizedException} Thrown if the refresh token is invalid or expired.
   */
  async getRefreshToken(refreshtokenDto: RefreshTokenDto): Promise<IJwtToken> {
    const { refreshToken } = refreshtokenDto;
    try {
      const { id } = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.userRepository.findOne({ where: { id } });
      return await this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Hashes a password using bcrypt.
   *
   * @param {string} password - The password to hash.
   * @returns {string} The hashed password.
   */
  hashPassword(password: string): string {
    return hashSync(password, 10);
  }

  /**
   * Generates JWT tokens for the provided user.
   *
   * @param {User} user - The user object for which to generate tokens.
   * @returns {Promise<IJwtToken>} A promise that resolves with the generated JWT tokens.
   */
  async generateToken(user: User): Promise<IJwtToken> {
    const { id, email, role, authStrategy } = user;

    // Sign access token and refresh token separately
    const accessTokenPromise = this.jwtService.signAsync(
      { sub: id, email, role, authStrategy },
      {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION',
        ),
      },
    );

    const refreshTokenPromise = this.jwtService.signAsync(
      { sub: id, email, role, authStrategy },
      {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
        ),
      },
    );

    // Wait for both promises to resolve
    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return { accessToken, refreshToken };
  }
}

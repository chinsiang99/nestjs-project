import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { hashSync } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>, //
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
   * Hashes a password using bcrypt.
   *
   * @param {string} password - The password to hash.
   * @returns {string} The hashed password.
   */
  private hashPassword(password: string): string {
    return hashSync(password, 10);
  }
}

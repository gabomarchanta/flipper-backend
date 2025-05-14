// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto'; // Crearemos este DTO
import { CreateUserDto } from './dto/create-user.dto'; // Crearemos este DTO

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const { email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      email,
      password_hash: password, // El hook @BeforeInsert en la entidad se encargará del hash
      // role: 'admin' // El default está en la entidad
    });

    try {
      await this.userRepository.save(user);
      this.logger.log(`User ${email} created successfully.`);
      return { message: 'Admin user created successfully. Please login.' };
    } catch (error) {
      this.logger.error(`Failed to create user ${email}`, error.stack);
      throw new InternalServerErrorException('Error creating user.');
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: { id: string, email: string, role: string} }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await user.validatePassword(password))) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      this.logger.log(`User ${email} logged in successfully.`);
      return {
        accessToken,
        user: { id: user.id, email: user.email, role: user.role },
      };
    } else {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials. Please check email and password.');
    }
  }

  // Método usado por JwtStrategy
  async validateUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user || null;
  }
}
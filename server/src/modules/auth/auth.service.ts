import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        plan: 'free',
        storageLimit: 1073741824, // 1GB
      },
    });

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async validateGoogleUser(details: {
    email: string;
    googleId: string;
    picture?: string;
  }) {
    console.log('Validating Google User', details);
    const user = await this.prisma.user.findUnique({
      where: { email: details.email },
    });

    if (user) {
      if (!user.googleId) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: details.googleId,
            avatarUrl: details.picture,
          },
        });
      } else if (details.picture && user.avatarUrl !== details.picture) {
        // Update avatar if changed
        await this.prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: details.picture },
        });
      }
      return user;
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: details.email,
        googleId: details.googleId,
        avatarUrl: details.picture,
        plan: 'free',
        storageLimit: 1073741824, // 1GB
      },
    });

    return newUser;
  }

  generateToken(user: {
    id: string;
    email: string;
    plan: string;
    avatarUrl?: string | null;
    storageUsed?: bigint;
    storageLimit?: bigint;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      plan: user.plan,
      avatarUrl: user.avatarUrl,
      storageUsed: user.storageUsed ? user.storageUsed.toString() : '0',
      storageLimit: user.storageLimit ? user.storageLimit.toString() : '0',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

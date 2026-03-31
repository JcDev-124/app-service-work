import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: RegisterDto): Promise<AuthTokensDto> {
    const email = input.email.toLowerCase().trim();
    const existingUser = await this.usersRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, this.bcryptRounds);
    const user = await this.usersRepository.save({
      email,
      passwordHash,
      refreshTokenHash: null,
    });

    return this.issueTokens(user);
  }

  async login(input: LoginDto): Promise<AuthTokensDto> {
    const email = input.email.toLowerCase().trim();
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const validRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!validRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const accessPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn,
      }),
    ]);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, this.bcryptRounds);
    await this.usersRepository.save(user);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.refreshTokenSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private get bcryptRounds(): number {
    return Number(this.configService.get<number>('BCRYPT_ROUNDS', 10));
  }

  private get accessTokenSecret(): string {
    return this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'access-secret-change-me',
    );
  }

  private get refreshTokenSecret(): string {
    return this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh-secret-change-me',
    );
  }

  private get accessTokenExpiresIn(): StringValue {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as StringValue;
  }

  private get refreshTokenExpiresIn(): StringValue {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as StringValue;
  }
}

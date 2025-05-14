// backend/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'; // Añade InternalServerErrorException
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      // Es crucial que JWT_SECRET esté definido. Si no, la aplicación no debería iniciar o funcionar.
      throw new InternalServerErrorException(
        'JWT_SECRET is not defined in environment variables. Application cannot start securely.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // Ahora jwtSecret es garantizado como string
    });
  }

  async validate(payload: { sub: string; email: string; role: string }): Promise<User> { // Asegúrate que el payload refleje lo que guardas en el token
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or invalid token.');
    }
    // Opcional: puedes verificar el rol aquí si es necesario para la estrategia
    // if (user.role !== payload.role) { // Por si el rol cambia y el token es viejo
    //   throw new UnauthorizedException('User role mismatch.');
    // }
    return user;
  }
}
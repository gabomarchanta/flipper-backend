// backend/src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport'; // Importa AuthGuard

@Controller('auth') // Ruta base para este controlador: /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint para crear el primer admin (o cualquier admin)
  // Podrías protegerlo más adelante para que solo un admin existente pueda crear otros
  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Endpoint de ejemplo para probar la protección con JWT
  @UseGuards(AuthGuard('jwt')) // Protege esta ruta
  @Get('/profile')
  getProfile(@Req() req) {
    // req.user es el payload del JWT validado por JwtStrategy
    return { message: 'This is a protected route!', user: req.user };
  }
}
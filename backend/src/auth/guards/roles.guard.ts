// backend/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../entities/user.entity'; // Asegúrate que la ruta sea correcta

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Si no se especifican roles, se permite el acceso (AuthGuard ya hizo su trabajo)
    }
    const { user } = context.switchToHttp().getRequest<{ user: User }>(); // Obtener el usuario del request
    
    if (!user || !user.role) {
        return false; // Si no hay usuario o no tiene rol, no permitir
    }
    
    return requiredRoles.some((role) => user.role === role);
  }
}
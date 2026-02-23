import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesEnum } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // it means that the route does not decorated with @Roles(), so we can skip the guard
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{
      user: { roles?: string | string[] };
    }>();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const normalizedRoles = Array.isArray(user.roles)
      ? user.roles
      : user.roles
        ? [user.roles]
        : [];

    if (normalizedRoles.length === 0) {
      throw new UnauthorizedException('User has no roles assigned');
    }

    const hasRole = requiredRoles.some((role) =>
      normalizedRoles.includes(role),
    );

    if (!hasRole) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}

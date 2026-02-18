import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

export const GetJwt = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>() as Request & {
      user: JwtPayload;
    };
    // return request.headers['authorization']?.split(' ')[1];

    return request.user;
  },
);

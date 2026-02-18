import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedSocket } from '../interfaces/web-socket.interface';

export const WsUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
    return client.data.user;
  },
);

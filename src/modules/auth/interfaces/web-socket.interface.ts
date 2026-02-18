import { Socket } from 'socket.io';
import type { JwtPayload } from './jwt-payload.interface';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload;
  };
}
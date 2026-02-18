import { RolesEnum } from '../enums/roles.enum';

export interface JwtPayload {
  userID: string;
  username?: string;
  roles?: RolesEnum | RolesEnum[] | undefined;
}

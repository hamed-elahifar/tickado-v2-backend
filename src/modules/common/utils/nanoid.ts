import { customAlphabet, nanoid } from 'nanoid';

export const createRoomID = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6,
) as () => string;

export const createUserId = () => nanoid();
export const createNominationID = () => nanoid(8);

import { User } from './types';

export function getToken({ userName, password }: User): string {
  return Buffer.from(`${userName}:${password}`).toString('base64');
}

export interface TokenPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
}

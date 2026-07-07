export type UserRole = 'admin' | 'user';

export interface AuthUser {
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

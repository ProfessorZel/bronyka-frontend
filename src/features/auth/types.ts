export interface Session {
  accessToken: string | null;
  user: User | null;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  fio: string;
  birthdate: string;
}

export interface LoginResponseData {
  token_type: string;
  access_token: string;
}

export interface Session {
  accessToken: string | null;
  user: User | null;
}

export type UserGroup = {
   name: string;
   adGroupDN: string;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  fio: string;
  birthdate: string;
  group: UserGroup;
}

export interface LoginResponseData {
  token_type: string;
  access_token: string;
}

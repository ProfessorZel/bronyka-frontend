export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  fio: string;
  birthdate: string;
  password: string;
}

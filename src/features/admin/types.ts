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

export interface EventLog {
  time: string;
  description: string;
  user_id: number;
  user: User;
}

export interface Group {
  name: string;
  adGroupDN: string;
  id: number;
}

export interface permissionsType {
   max_future_reservation: string;
   meetingroom_id: number;
}

export interface GroupRooms {
   name: string;
   adGroupDN: string;
   id: number;
   permissions: permissionsType[];
}

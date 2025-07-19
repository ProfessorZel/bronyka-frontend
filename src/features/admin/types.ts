import { UserGroup } from "../auth/types";

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  fio: string;
  birthdate: string;
  password: string;
  group: UserGroup;
}

export interface EventLog {
  time: string;
  description: string;
  user_id: number | undefined;
  user: User | undefined;
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

export type SheetsInstruction = {
  service_account_email: string;
  instructions: string;
} | undefined;

export type Sheets = {
  sheet: string;
}

export interface SpreadSheetsValidate{
  spreadsheet_url: string;
  title: string;
  worksheets: string[];
}

export interface WorkSheets {
    id: number;
    spreadsheet_url: string;
    worksheet: string;
    service_account_email: string;
}

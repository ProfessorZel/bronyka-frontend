import { User } from '../admin/types';

export interface MeetingRoom {
  name: string;
  description: string;
  // icon: string;
  id: 1;
}

export interface Reservation {
  from_reserve: string;
  to_reserve: string;
  id: number;
  meetingroom_id: number;
  user_id: number;
  meetingroom: MeetingRoom;
  user: User;
}

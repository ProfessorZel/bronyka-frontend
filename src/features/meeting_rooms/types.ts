export interface MeetingRoom {
  name: string;
  description: string;
  id: 1;
}

export interface Reservation {
  from_reserve: string;
  to_reserve: string;
  id: number;
  meetingroom_id: number;
  user_id: number;
}

export interface BigCalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Partial<BigCalendarEvent>;
}

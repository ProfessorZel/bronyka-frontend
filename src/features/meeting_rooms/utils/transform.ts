import { BigCalendarEvent, Reservation } from '../types';
export function reservationToCalendarEvents(
  events: Reservation[],
): BigCalendarEvent[] {
  return events.map((event) => {
    return {
      title: '',
      start: new Date(event.from_reserve),
      end: new Date(event.to_reserve),
    };
  });
}

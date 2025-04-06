import { Reservation } from '@/features/meeting_rooms/types';
import { BigCalendarEvent } from './BigCalendarReservations';

export function userConfirmAction(title: string) {
  const confirmChange = confirm(title);
  return confirmChange;
}

export function dateTimeFormatter(dtString: string) {
  const dt = new Date(dtString);
  return new Intl.DateTimeFormat('ru', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dt);
}

export function toNaiveISOString(date: Date) {
  const currentDate = new Date(date.getTime() + 3 * 3600000);
  return currentDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
}

export function reservationForBigCalendarDTO(
  events: Reservation[],
): BigCalendarEvent[] {
  return events.map((event) => {
    return {
      title: `${event.meetingroom.name} - ${event.user.fio}`,
      start: new Date(event.from_reserve),
      end: new Date(event.to_reserve),
      resource: event,
    };
  });
}

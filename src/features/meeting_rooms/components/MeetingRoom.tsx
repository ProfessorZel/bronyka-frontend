import { reservationForBigCalendarDTO } from '@/app/shared/utils';
import { BigCalendarReservations } from '../../../app/shared/BigCalendarReservations';
import { useMeetingRoomReservation } from '../hooks/useMeetingRoomReservation';

import { ReservationForm } from './ReservationForm';

const listStyles = {
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 20,
  paddingBottom: 100,
};

export function MeetingRoom() {
  const reservation = useMeetingRoomReservation();
  return (
    <div
      style={listStyles}
      className="overflow-y-auto h-full w-full flex flex-col gap-10"
    >
      <ReservationForm />
      <BigCalendarReservations
        events={reservation ? reservationForBigCalendarDTO(reservation) : []}
      />
    </div>
  );
}

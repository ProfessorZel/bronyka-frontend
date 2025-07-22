import { reservationForBigCalendarDTO } from '@/app/shared/utils';
import { BigCalendarReservations } from '../../../app/shared/BigCalendarReservations';
import { useMeetingRoomReservation } from '../hooks/useMeetingRoomReservation';

// import { ReservationForm } from './ReservationForm';
import { useParams } from 'react-router';
import { useRoom } from '@/features/admin/hooks/useRoom';
import useSWR from 'swr';
import { USERS_API } from '@/app/shared/constants';

const listStyles = {
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 20,
  paddingBottom: 100,
};

export function MeetingRoom() {
  const reservation = useMeetingRoomReservation();
  const { roomId } = useParams();
  const meetingroom = useRoom(roomId);
  const { data } = useSWR(`${USERS_API}/me`);
  const userId = data.id;

  return (
    <div
      style={listStyles}
      className="overflow-y-auto h-full w-full flex flex-col gap-10"
    >
      {/* <ReservationForm /> */}
      <BigCalendarReservations
        events={reservation ? reservationForBigCalendarDTO(reservation) : []}
        meetingRoom={meetingroom}
        roomId={parseInt(roomId? roomId: '0')}
        userId={String(userId)}
        user={data}
      />
    </div>
  );
}

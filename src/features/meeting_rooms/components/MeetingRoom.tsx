import { reservationForBigCalendarDTO, toNaiveISOString, userConfirmAction } from '@/app/shared/utils';
import { BigCalendarEvent, BigCalendarReservations } from '../../../app/shared/BigCalendarReservations';
import { useMeetingRoomReservation } from '../hooks/useMeetingRoomReservation';

// import { ReservationForm } from './ReservationForm';
import { useParams } from 'react-router';
import { useRoom } from '@/features/admin/hooks/useRoom';
import useSWR, { mutate } from 'swr';
import { MEETING_ROOMS_API, RESERVATIONS_API, USERS_API } from '@/app/shared/constants';
import { useNotifications } from '@/app/shared/hooks/useNotifications';
import { Reservation } from '../types';
import { useApi } from '@/app/shared/api/useApi';
import { AxiosError } from 'axios';
import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useState } from 'react';

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
  const { send, ctx } = useNotifications();
  const api = useApi();
  const [reservationEvents, setReservationEvents] = useState<BigCalendarEvent[]>(reservationForBigCalendarDTO(reservation))

  return (
    <div
      style={listStyles}
      className="overflow-y-auto h-full w-full flex flex-col gap-10"
    >
      {/* <ReservationForm /> */}
      <BigCalendarReservations
        events={reservationEvents}
        meetingRoom={meetingroom}
        roomId={parseInt(roomId? roomId: '0')}
        userId={String(userId)}
        user={data}
        handleReservation={(e, k) => handleReservation(e, k)}
        handleDeleteReservation={(e) => handleDeleteReservation(e)}
      />
      {ctx}
    </div>
  );

    async function handleReservation(reservationEvent: BigCalendarEvent, isCreate: boolean) {
    const from = reservationEvent.start;
    const to = reservationEvent.end;

    if (from >= to) {
      send('error', ['Invalid date and time range for reservation']);
      send('error', ['Время начала брони не может быть больше времени окончания брони']);
      return;
   } else if (from.getHours() >= to.getHours()) {
      send('error', ['Invalid date and time range for reservation']);
      send('error', ['Невозможно забронировать на несколько дней']);
      const mutateRes = await mutate(
        `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
        (data?: Reservation[]) => {
          if (!data) return data;
          return [...data];
        },
        {
          revalidate: false
        }
      );
      setReservationEvents(reservationForBigCalendarDTO(mutateRes as Reservation[]));
      return;
    } else if (reservationEvent.resource) {
      const payload = isCreate? {
        from_reserve: toNaiveISOString(from),
        to_reserve: toNaiveISOString(to),
        meetingroom_id: meetingroom?.id,
        user_id: String(userId),
      }: {
        from_reserve: toNaiveISOString(from),
        to_reserve: toNaiveISOString(to),
      };

      try {
        const res = isCreate?
          await api.post<Reservation>(RESERVATIONS_API, payload)
          :
          await api.patch<Reservation>(`${RESERVATIONS_API}/${reservationEvent.resource.id}`, payload);
        const mutateRes = await mutate(
          `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
          (data?: Reservation[]) => {
            if (!data) return data;
            if (isCreate) return [...data, res.data];

            return data.map(item => item.id === res.data.id? res.data: item);
          },
          {
            revalidate: false
          }
        );

        setReservationEvents(reservationForBigCalendarDTO(mutateRes as Reservation[]));
         
         send('success', [`Компьютер '${reservationEvent.title.split(':').pop()?.trim()}' забронирован Вами.${'\n'}Начало брони: ${dateCustomFormatting(from)}${'\n'}Окончание брони: ${dateCustomFormatting(to)}`]);
      } catch (error) {
         const mutateRes = await mutate(
           `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
           (data?: Reservation[]) => {
             if (!data) return data;

             return data.map(item => item.id === reservationEvent.resource?.id? reservationEvent.resource: item);
           },
           {
             revalidate: false
           }
         );
         setReservationEvents(reservationForBigCalendarDTO(mutateRes as Reservation[]));

         errorHandler(error);
      }
    }
  }

  function dateCustomFormatting(date: Date): string {
    const padStart = (value: number): string =>
       value.toString().padStart(2, '0');
    return(
       `${padStart(date.getDate())}/${padStart(date.getMonth() + 1)}/${date.getFullYear()} ${padStart(date.getHours())}:${padStart(date.getMinutes())}`
    );
  }

  async function handleDeleteReservation(id?: number) {
    try {
      const confirm = userConfirmAction(`Удалить заявку на бронирование`);
      if (!confirm) return;
      const res = await api.delete<Reservation>(`${RESERVATIONS_API}/${id}`);

      const mutateRes = await mutate(
        `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
        (data?: Reservation[]) => {
          if (!data) return data;

          return data.filter(item => item.id !== res.data.id);
        },
        {
          revalidate: false
        }
      );
      setReservationEvents(reservationForBigCalendarDTO(mutateRes as Reservation[]));

      send('success', ['Заявка на бронирование успешно удалена!']);
    } catch (e) {
      errorHandler(e);
    }
  }

  function errorHandler(error: any) {
    const err = error as AxiosError;
    
    if (err.status === 422) {
      const errHasData = err as AxiosError & {
        data: ResponseApiUnprocessableEntity;
      };
  
      if (Array.isArray(errHasData.data.detail)) {
        const errorMessages = errHasData.data.detail
          .flatMap(({ msg }) => (msg ? [msg] : []))
          .filter(Boolean);
  
        send('error', errorMessages);
      }
  
      if (typeof errHasData.data.detail === 'string') {
        send('error', [errHasData.data.detail]);
      }
    } else {
      send('error', ['Произошла непредвиденная ошибка']);
    }
  }
}

import { useApi } from '@/app/shared/api/useApi';
import { RESERVATIONS_API } from '@/app/shared/constants';
import type { Reservation } from '@/features/meeting_rooms/types';
import { Button } from 'antd';
import { useState } from 'react';
import { mutate } from 'swr';
import { ReservationDatetimeForm } from './ReservationDatetimeForm';

export function ReservationListItem(reservation: Reservation) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const api = useApi();

  return (
    <div className="flex flex-col gap-5">
      <span className="font-bold">Пользователь: {reservation.user.fio}</span>
      <span className="font-bold">
        Рабочее место: {reservation.meetingroom.name}
      </span>
      {!isEdit && (
        <>
          <Button
            onClick={() => {
              setIsEdit(true);
            }}
          >
            Редактировать дату и время
          </Button>
          <Button onClick={handleDeleteReservation}>Удалить</Button>
        </>
      )}
      {isEdit && (
        <ReservationDatetimeForm cancel={cancelEdit} {...reservation} />
      )}
    </div>
  );

  function cancelEdit() {
    setIsEdit(false);
  }

  async function handleDeleteReservation() {
    try {
      const reservationId = reservation.id;
      if (!reservationId) return;

      await api.delete<Reservation>(`${RESERVATIONS_API}/${reservationId}`);
    } catch (e) {
      console.log(e);
    } finally {
      await mutate(() => true, undefined, {
        revalidate: false,
      });
    }
  }
}

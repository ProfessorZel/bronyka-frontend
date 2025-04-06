import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useApi } from '@/app/shared/api/useApi';
import { RESERVATIONS_API } from '@/app/shared/constants';
import { useNotifications } from '@/app/shared/hooks/useNotifications';
import { toNaiveISOString } from '@/app/shared/utils';
import type { Reservation } from '@/features/meeting_rooms/types';
import { Button, DatePicker, Form } from 'antd';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import { mutate } from 'swr';

interface ReservationFormData {
  from: Date;
  to: Date;
}

export function ReservationDatetimeForm({
  id,
  from_reserve,
  to_reserve,
  cancel,
}: Reservation & { cancel: () => void }) {
  const api = useApi();
  const [reservationForm, setReservationForm] = useState<ReservationFormData>({
    from: new Date(from_reserve),
    to: new Date(to_reserve),
  });
  const { send, ctx } = useNotifications();

  return (
    <Form>
      <Form.Item label="От">
        <DatePicker
          value={dayjs(reservationForm.from)}
          showTime={{
            minuteStep: 10,
            showHour: true,
            showMinute: true,
          }}
          onChange={(_, dateStr) =>
            setReservationForm({
              ...reservationForm,
              from: new Date(dateStr as string),
            })
          }
          allowClear={false}
        />
      </Form.Item>
      <Form.Item label="До">
        <DatePicker
          showTime={{
            minuteStep: 10,
            showHour: true,
            showMinute: true,
          }}
          value={dayjs(reservationForm.to)}
          onChange={(_, dateStr) =>
            setReservationForm({
              ...reservationForm,
              to: new Date(dateStr as string),
            })
          }
          allowClear={false}
        />
      </Form.Item>
      {ctx}
      <div className="flex gap-5">
        <Button onClick={handlePatchReservation}>Сохранить</Button>
        <Button onClick={cancel}>Отмена</Button>
      </div>
    </Form>
  );

  async function handlePatchReservation() {
    if (!id) return;

    const payload = {
      from_reserve: toNaiveISOString(reservationForm.from),
      to_reserve: toNaiveISOString(reservationForm.to),
    };

    try {
      await api.patch<Reservation>(`${RESERVATIONS_API}/${id}`, payload);

      await mutate(() => true, undefined, {
        revalidate: true,
      });

      cancel();
    } catch (error) {
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
}

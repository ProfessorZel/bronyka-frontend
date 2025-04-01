import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useApi } from '@/app/shared/api/useApi';
import { RESERVATIONS_API } from '@/app/shared/constants';
import { useNotifications } from '@/app/shared/hooks/useNotifications';
import { toNaiveISOString } from '@/app/shared/utils';
import { Button, Card, DatePicker, Form } from 'antd';
import { AxiosError } from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { mutate } from 'swr';
import { useMeetingRooms } from '../hooks/useMeetingRooms';
import { Reservation } from '../types';

interface ReservationFormData {
  from: Date;
  to: Date;
}

const from = new Date();
const to = new Date(from.getTime() + 60 * 60 * 1000);

const defaultReservationFormData: ReservationFormData = {
  from,
  to,
};

export function ReservationForm() {
  const api = useApi();
  const { roomId } = useParams();
  const rooms = useMeetingRooms();
  const [reservationForm, setReservationForm] = useState<ReservationFormData>(
    defaultReservationFormData,
  );
  const { send, ctx } = useNotifications();

  const formTitle = useMemo(() => {
    const prefix = 'Оформить бронирование: ';
    const roomIdAsNumber = parseInt(roomId ?? '');
    const roomName = rooms.find((room) => room.id === roomIdAsNumber)?.name;

    return `${prefix} ${roomName}`;
  }, [rooms]);

  const set = (attrs: Partial<ReservationFormData>) => {
    setReservationForm({ ...reservationForm, ...attrs });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title={formTitle}>
        <Form
          labelCol={{ span: 4 }}
          layout="vertical"
          onSubmitCapture={handleReservation}
        >
          <Form.Item label="Начало бронирования">
            <DatePicker
              showTime
              value={dayjs(reservationForm.from)}
              onChange={(_: Dayjs, dateStr: string | string[]) => {
                const newDT = new Date(dateStr as string);
                set({ from: newDT });
              }}
            />
          </Form.Item>
          <Form.Item label="Окончание бронирования">
            <DatePicker
              showTime
              value={dayjs(reservationForm.to)}
              onChange={(_: Dayjs, dateStr: string | string[]) => {
                const newDT = new Date(dateStr as string);
                set({ to: newDT });
              }}
            />
          </Form.Item>
          <Button shape="round" type="primary" htmlType="submit">
            Заявка на бронирование
          </Button>
        </Form>
      </Card>
      {ctx}
    </div>
  );

  async function handleReservation() {
    const { from, to } = reservationForm;

    if (from >= to) {
      send('error', ['Invalid date and time range for reservation']);
      return;
    }

    const payload = {
      from_reserve: toNaiveISOString(from),
      to_reserve: toNaiveISOString(to),
      meetingroom_id: roomId,
    };

    try {
      await api.post<Reservation>(RESERVATIONS_API, payload);
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
    } finally {
      mutate(() => true, undefined, { revalidate: true });
    }
  }
}

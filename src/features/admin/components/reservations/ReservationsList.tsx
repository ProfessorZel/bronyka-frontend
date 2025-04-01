import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useApi } from '@/app/shared/api/useApi';
import { RESERVATIONS_API } from '@/app/shared/constants';
import { useNotifications } from '@/app/shared/hooks/useNotifications';
import { dateTimeFormatter, toNaiveISOString } from '@/app/shared/utils';
import { useMeetingRoomReservation } from '@/features/meeting_rooms/hooks/useMeetingRoomReservation';
import type { Reservation } from '@/features/meeting_rooms/types';
import {
  Button,
  Collapse,
  CollapseProps,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Switch,
} from 'antd';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { mutate } from 'swr';
interface HistoryToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
interface ReservationFormData {
  from: Date;
  to: Date;
}

export function ReservationList() {
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const reservations = useMeetingRoomReservation(showHistory);

  const handleDrawerClose = () => navigate('/admin/rooms');
  const handleHistoryToggle = (checked: boolean) => setShowHistory(checked);

  return (
    <Drawer open size="large" onClose={handleDrawerClose}>
      <div className="flex flex-col gap-10">
        <HistoryToggle checked={showHistory} onChange={handleHistoryToggle} />
        <ReservationCollapse
          items={transformReservationsToCollapseItems(reservations)}
        />
      </div>
    </Drawer>
  );
}

function HistoryToggle({ checked, onChange }: HistoryToggleProps) {
  return (
    <div className="flex items-center gap-5">
      <span>История бронирования:</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function ReservationCollapse({ items }: { items: CollapseProps['items'] }) {
  return (
    <div className="w-full h-auto overflow-y-auto">
      {items?.length ? <Collapse items={items} /> : <Empty />}
    </div>
  );
}

function ReservationListItem(reservation: Reservation) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const api = useApi();

  return (
    <div className="flex flex-col gap-5">
      <span>User ID: {reservation.user_id}</span>
      <span>Room ID: {reservation.meetingroom_id}</span>
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
        <ReservationDTChangeForm cancel={cancelEdit} {...reservation} />
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

function ReservationDTChangeForm({
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

function transformReservationsToCollapseItems(
  reservations: Reservation[],
): CollapseProps['items'] {
  return reservations.map((reservation) => ({
    key: reservation.id,
    label: `${dateTimeFormatter(
      reservation.from_reserve,
    )} - ${dateTimeFormatter(reservation.to_reserve)}`,
    children: <ReservationListItem {...reservation} />,
    showArrow: true,
  }));
}

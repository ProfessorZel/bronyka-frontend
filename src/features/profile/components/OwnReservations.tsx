import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useApi } from '@/app/shared/api/useApi';
import { BigCalendarReservations } from '@/app/shared/BigCalendarReservations';
import { RESERVATIONS_API, USERS_API } from '@/app/shared/constants';
import {
  NotificationType,
  useNotifications,
} from '@/app/shared/hooks/useNotifications';
import {
  dateTimeFormatter,
  reservationForBigCalendarDTO,
  userConfirmAction,
} from '@/app/shared/utils';
import { Reservation } from '@/features/meeting_rooms/types';
import { Button, List, Switch } from 'antd';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import useSWR, { mutate } from 'swr';
import { useOwnReservations } from '../hooks/useOwnReservations';
import { EditReservationForm } from './EditReservationForm';

interface HistoryToggleProps {
  history: boolean;
  onHistoryChange: (checked: boolean) => void;
  view: boolean;
  onViewChange: (checked: boolean) => void;
}

type ListItemProps = Reservation & {
  send: (type: NotificationType, messages: string[]) => void;
};

const df = dateTimeFormatter;

export function OwnReservationsList() {
  const [history, setHistory] = useState<boolean>(false);
  const [viewCalendar, setViewCalendar] = useState<boolean>(false);
  const { send, ctx } = useNotifications();

  const reservations = useOwnReservations(history);
  const { data } = useSWR(`${USERS_API}/me`);
  const userId = data.id;

  return (
    <div className="h-auto w-full overflow-y-auto">
      <ListHeader
        view={viewCalendar}
        onViewChange={setViewCalendar}
        history={history}
        onHistoryChange={setHistory}
      />
      <div className="w-full h-full">
        {viewCalendar ? (
          <BigCalendarReservations
            events={reservationForBigCalendarDTO(reservations)}
            meetingRoom={null}
            roomId={undefined}
            userId={String(userId)}
            user={data}
          />
        ) : (
          <List
            className="w-full bg-white"
            bordered
            dataSource={reservations.map((item) => ({ ...item, send }))}
            renderItem={history ? ListItemWithoutControls : ListItem}
          />
        )}
        {ctx}
      </div>
    </div>
  );
}

function ListItemWithoutControls({
  from_reserve,
  to_reserve,
  meetingroom,
}: ListItemProps) {
  const datetime = `${df(from_reserve)} - ${df(to_reserve)}`;

  return (
    <List.Item>
      <div
        className="w-full flex flex-row justify-between items-center"
        style={{ padding: 10 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <p className="font-semibold">
            <span className="font-extrabold">Рабочее место:</span>{' '}
            {meetingroom.name}
          </p>
          <p className="font-semibold">
            <span className="font-extrabold">Дата:</span> {datetime}
          </p>
        </div>
      </div>
    </List.Item>
  );
}

function ListItem({
  from_reserve,
  to_reserve,
  meetingroom,
  meetingroom_id,
  user,
  user_id,
  id,
  send,
}: ListItemProps) {
  const datetime = `${df(from_reserve)} - ${df(to_reserve)}`;
  const api = useApi();
  const reservat: Reservation = {
    id: id,
    from_reserve: from_reserve,
    to_reserve: to_reserve,
    meetingroom: meetingroom,
    meetingroom_id: meetingroom_id,
    user: user,
    user_id: user_id
  }

  return (
    <List.Item>
      <div
        className="w-full flex flex-row justify-between items-center"
        style={{ padding: 10 }}
      >
        <div className="grid grid-rows-2">
          <p className="font-semibold">
            <span className="font-extrabold">Рабочее место:</span>{' '}
            {meetingroom.name}
          </p>
          <p className="font-semibold">
            <span className="font-extrabold">Дата:</span> {datetime}
          </p>
          <EditReservationForm {...reservat}/>
        </div>
        <Button
          color="red"
          variant="solid"
          icon={<MdDelete />}
          shape="circle"
          onClick={handleDeleteReservation}
        />
      </div>
    </List.Item>
  );

  async function handleDeleteReservation() {
    try {
      const confirm = userConfirmAction(`Удалить заявку на бронирование`);
      if (!confirm) return;
      await api.delete(`${RESERVATIONS_API}/${id}`);
      send('success', ['Заявка на бронирование успешно удалена!']);
    } catch (e) {
      const err = e as AxiosError;

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
      await mutate(() => true, undefined, { revalidate: true });
    }
  }
}

function ListHeader({
  history,
  onHistoryChange,
  view,
  onViewChange,
}: HistoryToggleProps) {
  return (
    <div className="flex items-center gap-5" style={{ padding: 10 }}>
      <span className="font-semibold text-black">
        Мои заявки на бронирование
      </span>

      <div className="flex gap-2 flex-wrap">
        <Switch checked={history} onChange={onHistoryChange} />
        <span
          className={`font-bold ${history ? 'text-blue-500' : 'text-black'}`}
        >
          История
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Switch checked={view} onChange={onViewChange} />
        <span className={`font-bold ${view ? 'text-blue-500' : 'text-black'}`}>
          Календарь
        </span>
      </div>
    </div>
  );
}

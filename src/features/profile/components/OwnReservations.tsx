import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useApi } from '@/app/shared/api/useApi';
import { BigCalendarEvent, BigCalendarReservations } from '@/app/shared/BigCalendarReservations';
import { RESERVATIONS_API, USERS_API } from '@/app/shared/constants';
import {
  useNotifications,
} from '@/app/shared/hooks/useNotifications';
import {
  dateTimeFormatter,
  reservationForBigCalendarDTO,
  toNaiveISOString,
  userConfirmAction,
} from '@/app/shared/utils';
import { Reservation } from '@/features/meeting_rooms/types';
import { Button, List, Switch } from 'antd';
import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
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

type ListItemProps = Reservation & {handleDeleteReservation: (e: number) => void};

const df = dateTimeFormatter;

export function OwnReservationsList() {
  const [history, setHistory] = useState<boolean>(false);
  const [viewCalendar, setViewCalendar] = useState<boolean>(true);
  const { send, ctx } = useNotifications();
  const api = useApi();
  const memohistory = useMemo(() => history, [history]);
  
  const reservations = useOwnReservations(history);
  const { data } = useSWR(`${USERS_API}/me`);
  const userId = data.id;
  const [reservationEvents, setReservationEvents] = useState<BigCalendarEvent[]>(reservationForBigCalendarDTO(reservations))

  useEffect(() => {
   setReservationEvents(reservationForBigCalendarDTO(reservations));
  }, [memohistory]);

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
            events={reservationEvents}
            meetingRoom={null}
            roomId={undefined}
            userId={String(userId)}
            user={data}
            handleReservation={(e, k) => handleReservation(e, k)}
            handleDeleteReservation={(e) => handleDeleteReservation(e)}
          />
        ) : (
          <List
            className="w-full bg-white"
            bordered
            dataSource={reservations.map((item) => ({ ...item, handleDeleteReservation }))}
            renderItem={history ? ListItemWithoutControls : ListItem}
          />
        )}
        {ctx}
      </div>
    </div>
  );

  async function handleReservation(reservationEvent: BigCalendarEvent, isCreate: boolean) {
    const from = reservationEvent.start;
    const to = reservationEvent.end;

    if (from >= to) {
      send('error', ['Invalid date and time range for reservation']);
      send('error', ['Время начала брони не может быть больше времени окончания брони']);
      return;
    }
    if (from.getHours() > to.getHours()) {
      const mutateRes = await mutate(
        `${RESERVATIONS_API}/my_reservations?history=${history}`,
        (data?: Reservation[]) => {
          if (!data) return data;
          return [...data];
        },
        {
          revalidate: false
        }
      );
      setReservationEvents(reservationForBigCalendarDTO(mutateRes as Reservation[]));
      send('error', ['Невозможно забронировать на несколько дней']);
      send('error', ['Invalid date and time range for reservation']);
      return;
    }

    if (reservationEvent.resource) {
      const payload = isCreate? {
        from_reserve: toNaiveISOString(from),
        to_reserve: toNaiveISOString(to),
        meetingroom_id: parseInt(String(reservationEvent.resource.meetingroom_id)),
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
          `${RESERVATIONS_API}/my_reservations?history=${history}`,
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
           `${RESERVATIONS_API}/my_reservations?history=${history}`,
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
        `${RESERVATIONS_API}/my_reservations?history=${history}`,
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
  handleDeleteReservation,
//   send,
}: ListItemProps) {
  const datetime = `${df(from_reserve)} - ${df(to_reserve)}`;
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
          onClick={async () => await handleDeleteReservation(id)}
        />
      </div>
    </List.Item>
  );
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

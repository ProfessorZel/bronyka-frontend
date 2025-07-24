import { MeetingRoom, Reservation } from '@/features/meeting_rooms/types';
import { Button, Select } from 'antd';
import { useState } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import { calendarConfig } from '../../features/meeting_rooms/calendarConfig';
import moment from 'moment';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { toNaiveISOString, userConfirmAction } from './utils';
import { AxiosError } from 'axios';
import { ResponseApiUnprocessableEntity } from './api/types';
import { MEETING_ROOMS_API, RESERVATIONS_API } from './constants';
import { useApi } from './api/useApi';
import { mutate } from 'swr';
import { useNotifications } from './hooks/useNotifications';
import { User } from '@/features/admin/types';
import { DataModal } from './Modal-rbc';

export interface BigCalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Partial<Reservation>;
}

interface BigCalendarReservationsProps {
  events: BigCalendarEvent[];
  userId: string | undefined;
  roomId: number | undefined;
  meetingRoom: MeetingRoom | null;
  user: User;
}

interface ModalData {
  isCreate: boolean;
  isModalOpen: boolean;
}

function keys<T extends object>(obj: T) {
    return Object.keys(obj) as Array<keyof T>;
}

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export function BigCalendarReservations({
  events,
  userId,
  roomId,
  meetingRoom,
  user
}: BigCalendarReservationsProps) {
  const [activeView, setActiveView] = useState<View>(Views.WEEK);
  const [activeStep, setActiveStep] = useState<number>(30);//calendarConfig.step
  const api = useApi();
  const { send, ctx } = useNotifications();
  
  const defaultModalData: ModalData = {
    isCreate: true,
    isModalOpen: false,
  }

  const defaultReservationForm: Reservation = {
    id: newEventId(),
    from_reserve: String(new Date()),
    to_reserve: String(new Date((new Date()).getTime()+3600000)),
    meetingroom_id: parseInt(String(roomId)),
    meetingroom: meetingRoom? meetingRoom: {id: 1, name: '', description:  ''},
    user: user,
    user_id: parseInt(String(userId)),
  }
  
  const [ reservationForm, setReservationForm ] = useState<Reservation>(defaultReservationForm);
  const [ modulData, setIsModal ] = useState<ModalData>(defaultModalData);
  
  function showModal(e: string, reservElement: Reservation) {
    if (e === 'create') {
      setIsModal({ ...modulData, isModalOpen: true, isCreate: true });
      setReservationForm({...reservElement});
    } else if (e === 'change') {
      setIsModal({ isModalOpen: true, isCreate: false})
      setReservationForm({...reservElement});
    }
  }

  function closeModul() {
    setIsModal({...modulData, isModalOpen: false});
  }

  function newEventId() {
    let max = 0;
    if (events.length > 0) {
      events.map((e) => {
        if (e.resource?.id) {
          if (max < e.resource.id) {
            max = e.resource.id;
          }
        }
      });
    }
    return max+1;
  }

  return (
    <div
      className="flex flex-col w-full h-[1000px] gap-2"
      style={{ paddingBottom: 10 }}
    >
      <div className="flex flex-row gap-2">
        <Button
          type={activeView === Views.DAY ? 'primary' : 'default'}
          onClick={() => setActiveView(Views.DAY)}
        >
          День
        </Button>
        <Button
          type={activeView === Views.WEEK ? 'primary' : 'default'}
          onClick={() => setActiveView(Views.WEEK)}
        >
          Неделя
        </Button>
        <Button
          type={activeView === Views.MONTH ? 'primary' : 'default'}
          onClick={() => setActiveView(Views.MONTH)}
        >
          Месяц
        </Button>
        {activeView !== Views.MONTH && (
          <Select
            defaultValue={activeStep}
            onChange={(value) => setActiveStep(value)}
          >
            <Select.Option value={10}>10 минут</Select.Option>
            <Select.Option value={15}>15 минут</Select.Option>
            <Select.Option value={30}>30 минут</Select.Option>
            <Select.Option value={60}>1 час</Select.Option>
          </Select>
        )}
      </div>
      <DnDCalendar
        selectable
        defaultDate={moment().toDate()}
        defaultView="month"
        onView={() => {}}
        onNavigate={() => {}}
        view={activeView}
        className="bg-white rounded-md"
        style={{
          padding: 10,
        }}
        events={events ?? []}
        {...calendarConfig}
        step={activeStep}
        localizer={localizer}
        onEventResize={(e) => reSizeEvent(e)}
        onEventDrop={(e) => dropEvent(e)}
        onSelectSlot={(e) => addEvent(e)}
        onDoubleClickEvent={(e) => modalEvent(e)}
        onKeyPressEvent={(e, keyPressed) => deleteEvent(e, keyPressed)}
      >
      </DnDCalendar>
      {modulData.isModalOpen?
        <DataModal
          isCreate={modulData.isCreate}
          isModalOpen={modulData.isModalOpen}
          handleOk={() => {return setIsModal({...modulData, isModalOpen: false})}}
          handleCancel={() => closeModul()}
          handelDelete={() => {return setIsModal({...modulData, isModalOpen: false})}}
          handelSetReserv={(reservation) => {return setReservationForm({...reservation})}}
          reservationForm={reservationForm}
          handleReservation={(e, k) => handleReservation(e, k)}
          handleDeleteReservation={(e) => handleDeleteReservation(e)}
        />
      : null}
      {/* <Calendar
        defaultView={Views.MONTH}
        onView={() => {}}
        onNavigate={() => {}}
        view={activeView}
        className="bg-white rounded-md"
        style={{
          padding: 10,
        }}
        events={events ?? []}
        defaultDate={new Date()}
        {...calendarConfig}
        step={activeStep}
      /> */}
      {ctx}
    </div>
  );

  function reSizeEvent(e: any) {
    events.forEach(eventik => {
      if (eventik.resource?.id === e.event.resource?.id) {
        eventik.start = new Date(e.start);
        eventik.end = new Date(e.end);
      }
    });
    handleReservation(e.event, false);
  }

  function dropEvent(e: any) {
    events.forEach(eventik => {
      if (eventik.resource?.id === e.event.resource?.id) {
        eventik.start = new Date(e.start);
        eventik.end = new Date(e.end);
      }
    });
    handleReservation(e.event, false);
  }

  function addEvent(e: any) {
    if (meetingRoom) {
      const newEvent: BigCalendarEvent = {
        title: events[0]? events[0].title: 'Новая бронь',
        start: new Date(e.start),
        end: new Date(e.end),
        allDay: false,
        resource: {
          id: newEventId(),
          from_reserve: String(new Date(e.start)),
          to_reserve: String(new Date(e.end)),
          meetingroom_id: parseInt(String(roomId)),
          meetingroom: meetingRoom,
          user: user,
          user_id: parseInt(String(userId)),
        }
      }
      events.push(newEvent);
      handleReservation(newEvent, true)
    } else {
      showModal('create', {
        id: newEventId(),
        from_reserve: e.start,
        to_reserve: e.end,
        meetingroom_id: parseInt(String(roomId)),
        meetingroom: {id: 1, name: 'Выберите комнату', description: ''},
        user: user,
        user_id: parseInt(String(userId)),
      });
    }
  }

  function deleteEvent(e: any, keyPressed: any) {
    if (keyPressed.key === 'Delete') {
      const eResource = keys(e)[keys(e).length - 1];
      const eResourceKeys = keys(e[eResource]);
      let eId;
      eResourceKeys.map(el => {
        if (el === 'id') {
          eId = e[eResource][el];
        }
      });
      handleDeleteReservation(eId);
    }
  }

  function modalEvent(e: any) {
    showModal('change', {...e.resource, from_reserve: e.start, to_reserve: e.end});
  }

  //requests
  function dateCustomFormatting(date: Date): string {
    const padStart = (value: number): string =>
       value.toString().padStart(2, '0');
    return(
       `${padStart(date.getDate())}/${padStart(date.getMonth() + 1)}/${date.getFullYear()} ${padStart(date.getHours())}:${padStart(date.getMinutes())}`
    );
  } 

  async function handleReservation(reservationEvent: BigCalendarEvent, isCreate: boolean) {
    const from = reservationEvent.start;
    const to = reservationEvent.end;

    if (from >= to) {
      send('error', ['Invalid date and time range for reservation']);
      send('error', ['Время начала брони не может быть больше времени окончания брони']);
      return;
    }

    if (reservationEvent.resource) {
      const payload = isCreate? {
        from_reserve: toNaiveISOString(from),
        to_reserve: toNaiveISOString(to),
        meetingroom_id: parseInt(String(reservationEvent.resource.meetingroom_id)),
        user_id: userId,
      }: {
        from_reserve: toNaiveISOString(from),
        to_reserve: toNaiveISOString(to),
      };

      try {
        const res = isCreate?
          await api.post<Reservation>(RESERVATIONS_API, payload)
          :
          await api.patch<Reservation>(`${RESERVATIONS_API}/${reservationEvent.resource.id}`, payload);

        await mutate(
          `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
          (data?: Reservation[]) => {
            if (!data) return data;

            return data.map(item => item === res.data? res.data: item);
          },
          {
            revalidate: true
          }
        );
  
        send('success', [`Компьютер '${reservationEvent.title.split(':').pop()?.trim()}' забронирован Вами.${'\n'}Начало брони: ${dateCustomFormatting(from)}${'\n'}Окончание брони: ${dateCustomFormatting(to)}`]);
      } catch (error) {
        errorHandler(error);

        const even: Reservation = {
          from_reserve: toNaiveISOString(from),
          to_reserve: toNaiveISOString(to),
          meetingroom_id: parseInt(String(reservationEvent.resource.meetingroom_id)),
          meetingroom: meetingRoom? meetingRoom: {id: 1, name: '', description: ''},
          user: user,
          user_id: parseInt(String(userId)),
          id: parseInt(String(reservationEvent.resource.id)),
        }

        await mutate(
          `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
          (data?: Reservation[]) => {
            if (!data) return data;

            return data;
          },
          {
          populateCache: (reserv: Reservation[]) => {
              // filter the list, and return it with the updated item
              const filteredTodos = reserv.filter(item => item.id !== 0)
              return [...filteredTodos, even]
          },
          // Since the API already gives us the updated information,
          // we don't need to revalidate here.
          revalidate: false
        })

        await mutate(
          `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
          (data?: Reservation[]) => {
            if (!data) return data;

            return data;
          },
          {
            revalidate: true
          }
        );

      }
    }
  }

  async function handleDeleteReservation(id?: number) {
    try {
      const confirm = userConfirmAction(`Удалить заявку на бронирование`);
      if (!confirm) return;
      const res = await api.delete<Reservation>(`${RESERVATIONS_API}/${id}`);

      mutateCalendarEvents(res.data, roomId, false);

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


async function mutateCalendarEvents(event: Reservation, roomId?: number, create?: boolean) {
  if (!event) return;
  
  await mutate(
    `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
    (data?: Reservation[]) => {
      if (!data) return data;
      if (create) return [...data, event];

      return data.map((item) => (item.id === event.id? event: item));
    },
    {
      revalidate: true
    }
  );
}

import { /*MeetingRoom,*/ Reservation } from '@/features/meeting_rooms/types';
import { Button, Select } from 'antd';
import { useState } from 'react';
import { Calendar, /*momentLocalizer,*/ View, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import { calendarConfig } from '../../features/meeting_rooms/calendarConfig';
// import moment from 'moment';
// import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
// import { toNaiveISOString } from './utils';
// import { AxiosError } from 'axios';
// import { ResponseApiUnprocessableEntity } from './api/types';
// import { RESERVATIONS_API } from './constants';
// import { useApi } from './api/useApi';
// import { mutate } from 'swr';
// import { useNotifications } from './hooks/useNotifications';
// import { User } from '@/features/admin/types';

export interface BigCalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Partial<Reservation>;
}

interface BigCalendarReservationsProps {
  event: BigCalendarEvent[];
  // userId: string | undefined;
  // roomId: number | undefined;
  // meetingRoom: MeetingRoom | null;
  // user: User;
}

// const localizer = momentLocalizer(moment);
// const DnDCalendar = withDragAndDrop(Calendar);

export function BigCalendarReservations({
  event,
  // userId,
  // roomId,
  // meetingRoom,
  // user
}: BigCalendarReservationsProps) {
  const [activeView, setActiveView] = useState<View>(Views.WEEK);
  const [activeStep, setActiveStep] = useState<number>(30);//calendarConfig.step
  const [ events, /*setEvents*/] = useState<BigCalendarEvent[]>(event);
  // const api = useApi();
  // const { send, ctx } = useNotifications();
  // console.log(userId, roomId);

  // function newEventId() {
  //   let max = 0;
  //   if (events.length > 0) {
  //     events.map((e) => {
  //       if (e.resource?.id) {
  //         if (max < e.resource.id) {
  //           max = e.resource.id;
  //         }
  //       }
  //     });
  //   }
  //   return max+1;
  // }

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
      {/* <DnDCalendar
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
      /> */}
      <Calendar
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
      />
      {/* {ctx} */}
    </div>
  );

  // function reSizeEvent(e: any) {
  //   events.forEach(eventik => {
  //     if (eventik.resource?.id === e.event.resource?.id) {
  //       eventik.start = new Date(e.start);
  //       eventik.end = new Date(e.end);
  //     }
  //   });
  //   handleReservation(e.event, false);
  // }

  // function dropEvent(e: any) {
  //   events.forEach(eventik => {
  //     if (eventik.resource?.id === e.event.resource?.id) {
  //       eventik.start = new Date(e.start);
  //       eventik.end = new Date(e.end);
  //     }
  //   });
  //   handleReservation(e.event, false);
  // }

  // function addEvent(e: any) {
  //   const newEvent: BigCalendarEvent = {
  //     title: events[0]? events[0].title: 'Новая бронь',
  //     start: new Date(e.start),
  //     end: new Date(e.end),
  //     allDay: false,
  //     resource: {
  //       id: newEventId(),
  //       from_reserve: String(new Date(e.start)),
  //       to_reserve: String(new Date(e.end)),
  //       meetingroom_id: parseInt(String(roomId)),
  //       meetingroom: meetingRoom? meetingRoom: undefined,
  //       user: user,
  //       user_id: parseInt(String(userId)),
  //     }
  //   }
  //   setEvents(state => [ ...state, newEvent ]);
  //   handleReservation(newEvent, true)
  // }

  // function dateCustomFormatting(date: Date): string {
  //     const padStart = (value: number): string =>
  //        value.toString().padStart(2, '0');
  //     return(
  //        `${padStart(date.getDate())}/${padStart(date.getMonth() + 1)}/${date.getFullYear()} ${padStart(date.getHours())}:${padStart(date.getMinutes())}`
  //     );
  //  } 

  // async function handleReservation(reservationEvent: BigCalendarEvent, isCreate: boolean) {
  //   const from = reservationEvent.start;
  //   const to = reservationEvent.end;

  //   if (from >= to) {
  //     send('error', ['Invalid date and time range for reservation']);
  //     send('error', ['Время начала брони не может быть больше времени окончания брони']);
  //     return;
  //   }

  //   let payload;

  //   if (reservationEvent.resource) {
  //     payload = isCreate? {
  //       from_reserve: toNaiveISOString(from),
  //       to_reserve: toNaiveISOString(to),
  //       meetingroom_id: roomId,
  //       user_id: userId,
  //     }: {
  //       from_reserve: toNaiveISOString(from),
  //       to_reserve: toNaiveISOString(to),
  //       user_id: String(reservationEvent.resource.user_id),
  //     };

  //     try {
  //       if (isCreate) {
  //         await api.post<Reservation>(RESERVATIONS_API, payload);
  //       } else {
  //         await api.patch<Reservation>(`${RESERVATIONS_API}/${reservationEvent.resource.id}`, payload)
  //       }
  
  //       send('success', [`Компьютер '${reservationEvent.title.split(':').pop()?.trim()}' забронирован Вами.${'\n'}Начало брони: ${dateCustomFormatting(from)}${'\n'}Окончание брони: ${dateCustomFormatting(to)}`]);
  //     } catch (error) {
  //       const err = error as AxiosError;
  
  //       if (err.status === 422) {
  //         const errHasData = err as AxiosError & {
  //           data: ResponseApiUnprocessableEntity;
  //         };
  
  //         if (Array.isArray(errHasData.data.detail)) {
  //           const errorMessages = errHasData.data.detail
  //             .flatMap(({ msg }) => (msg ? [msg] : []))
  //             .filter(Boolean);
  
  //           send('error', errorMessages);
  //         }
  
  //         if (typeof errHasData.data.detail === 'string') {
  //           send('error', [errHasData.data.detail]);
  //         }
  //       } else {
  //         send('error', ['Произошла непредвиденная ошибка']);
  //       }
  //     } finally {
  //       mutate(() => true, undefined, { revalidate: true });
  //     }
  //   }
  // }

}
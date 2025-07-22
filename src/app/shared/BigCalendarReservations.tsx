import { MeetingRoom, Reservation } from '@/features/meeting_rooms/types';
import { Button, Modal, Form, Select, DatePicker } from 'antd';
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
import dayjs from 'dayjs';

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
  // const [ events, setEvents ] = useState<BigCalendarEvent[]>(event);
  const api = useApi();
  const { send, ctx } = useNotifications();
  console.log(userId, roomId);

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
        onDoubleClickEvent={(e) => deleteEvent(e)}
        popup
      >
      </DnDCalendar>
      {/* <Popover
        title={<span>cas</span>}
        content={<span>obvjfhbvd</span>}
        trigger={'hover'}
      >
        <Button>sdvv</Button>
      </Popover> */}
      {/* <Modal
        title="Создать бронь"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        
      </Modal> */}
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
      console.log(e);
      const k = keys(e)
      let start, end;
      k.map(item => {
        if (String(item) === "start") {
          start = e[item];
        } else if (String(item) === "end") {
          end = e[item];
        }
      });
      if (start && end) {
        end = new Date(end);
        start = new Date(start);
        console.log((end.getTime()-start.getTime())/1000/3600);
        // showModal();
        DataModal({
          id: newEventId(),
          from_reserve: String(new Date(e.start)),
          to_reserve: String(new Date(e.end)),
          meetingroom_id: parseInt(String(roomId)),
          meetingroom: meetingRoom? meetingRoom: {id: 1, name: '', description: ''},
          user: user,
          user_id: parseInt(String(userId)),
        });
      }
    }
  }

  function deleteEvent(e: any) {
    const eResource = keys(e)[keys(e).length - 1];
    const eResourceKeys = keys(e[eResource]);
    let eId;
    eResourceKeys.map(el => {
      if (el === 'id') {
        eId = e[eResource][el];
      }
    });
    // handleDeleteReservation(eId);
    DataModal(e.resource);
  }

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
        meetingroom_id: roomId,
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

        mutateCalendarEvents(res.data, roomId);
  
        send('success', [`Компьютер '${reservationEvent.title.split(':').pop()?.trim()}' забронирован Вами.${'\n'}Начало брони: ${dateCustomFormatting(from)}${'\n'}Окончание брони: ${dateCustomFormatting(to)}`]);
      } catch (error) {
        errorHandler(error);

        const even: Reservation = {
          from_reserve: toNaiveISOString(from),
          to_reserve: toNaiveISOString(to),
          meetingroom_id: roomId? parseInt(String(roomId)): 1,
          meetingroom: meetingRoom? meetingRoom: {id: 1, name: '', description: ''},
          user: user,
          user_id: parseInt(String(userId)),
          id: parseInt(String(reservationEvent.resource.id)),
        }

        mutateCalendarEvents(even, roomId? roomId: 1)
      }
    }
  }

  async function handleDeleteReservation(id?: number) {
    try {
      const confirm = userConfirmAction(`Удалить заявку на бронирование`);
      if (!confirm) return;
      const res = await api.delete<Reservation>(`${RESERVATIONS_API}/${id}`);

      mutateCalendarEvents(res.data, roomId);

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

  function DataModal(reservationForm: Reservation) {
    Modal.info({
      icon: null,
      title: "Создать бронь",
      closable: { 'aria-label': 'Custom Close Button' },
      content: (
        <Form>
          <Form.Item label="От">
            <DatePicker
              value={dayjs(reservationForm.from_reserve)}
              showTime={{
                minuteStep: 10,
                showHour: true,
                showMinute: true,
              }}
              onChange={(_, dateStr) =>{}
                // setReservationForm({
                //   ...reservationForm,
                //   from: new Date(dateStr as string),
                // })
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
              value={dayjs(reservationForm.to_reserve)}
              onChange={(_, dateStr) =>{}
                // setReservationForm({
                //   ...reservationForm,
                //   to: new Date(dateStr as string),
                // })
              }
              allowClear={false}
            />
          </Form.Item>
        </Form>
        // <div className='w-[full] flex flex-col'>  
        //   <span>Комната:</span>
        //   <Select
        //     defaultValue={30}
        //     onChange={() => {}}
        //   >
        //     <Select.Option value={10}>10 минут</Select.Option>
        //     <Select.Option value={15}>15 минут</Select.Option>
        //     <Select.Option value={30}>30 минут</Select.Option>
        //     <Select.Option value={60}>1 час</Select.Option>
        //   </Select>
        //   <span>Начало брони:</span>
        //   <span>{String(new Date())}</span>
        //   <span>Продолжительность в часах</span>
        //   <Select
        //     defaultValue={1}
        //     onChange={() => {}}
        //   >
        //     {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(e => {
        //       return <Select.Option value={e}>{e}</Select.Option>;
        //     })}
        //   </Select>
        //   <span>Конец брони:</span>
        //   <span>{String(new Date())}</span>
        // </div>
      ),
      okCancel: true,
      maskClosable: true,
      onOk() { },
    });
  }
}


async function mutateCalendarEvents(event: Reservation, roomId?: number) {
  if (!event) return;

  mutate(
    `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
    (data?: Reservation[]) => {
      if (!data) return data;

      return data.map((item) => (item.id === event.id? event: item));
    },
    {
      revalidate: true
    }
  );
}

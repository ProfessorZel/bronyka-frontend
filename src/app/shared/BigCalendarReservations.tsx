import { MeetingRoom, Reservation } from '@/features/meeting_rooms/types';
import { Button, Select } from 'antd';
import { useState } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import { calendarConfig } from '../../features/meeting_rooms/calendarConfig';
import moment from 'moment';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { User } from '@/features/admin/types';
import { DataModal } from './Modal-rbc';

export interface BigCalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Reservation;
}

interface BigCalendarReservationsProps {
  events: BigCalendarEvent[];
  userId: string | undefined;
  roomId: number | undefined;
  meetingRoom: MeetingRoom | null;
  user: User;
  handleReservation: (e: BigCalendarEvent, k: boolean) => void;
  handleDeleteReservation: (e: number) => void;
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
  user,
  handleReservation,
  handleDeleteReservation
}: BigCalendarReservationsProps) {
  const [activeView, setActiveView] = useState<View>(Views.WEEK);
  const [activeStep, setActiveStep] = useState<number>(30);//calendarConfig.step
  
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
      if (eId) {
         handleDeleteReservation(eId);
      }
    }
  }

  function modalEvent(e: any) {
    showModal('change', {...e.resource, from_reserve: e.start, to_reserve: e.end});
  }

  //requests
  
}

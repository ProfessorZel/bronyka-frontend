import { Reservation } from '@/features/meeting_rooms/types';
import { Button, Select } from 'antd';
import { useState } from 'react';
import { Calendar, View, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import { calendarConfig } from '../../features/meeting_rooms/calendarConfig';

export interface BigCalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Partial<Reservation>;
}

interface BigCalendarReservationsProps {
  events: BigCalendarEvent[];
}

export function BigCalendarReservations({
  events,
}: BigCalendarReservationsProps) {
  const [activeView, setActiveView] = useState<View>(Views.DAY);
  const [activeStep, setActiveStep] = useState<number>(calendarConfig.step);

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
    </div>
  );
}

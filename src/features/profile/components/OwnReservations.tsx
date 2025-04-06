import { BigCalendarReservations } from '@/app/shared/BigCalendarReservations';
import { reservationForBigCalendarDTO } from '@/app/shared/utils';
import { FloatButton, Switch } from 'antd';
import { useState } from 'react';
import { useOwnReservations } from '../hooks/useOwnReservations';
FloatButton;

interface HistoryToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function OwnReservationsList() {
  const [history, setHistory] = useState<boolean>(false);

  const reservations = useOwnReservations(history);

  return (
    <div className="h-auto w-full overflow-y-auto">
      <ListHeader checked={history} onChange={setHistory} />
      <div className="w-full h-full">
        <BigCalendarReservations
          events={reservationForBigCalendarDTO(reservations)}
        />
      </div>
    </div>
  );
}

function ListHeader({ checked, onChange }: HistoryToggleProps) {
  return (
    <div className="flex items-center gap-5" style={{ padding: 10 }}>
      <span
        className={`font-semibold ${checked ? 'text-blue-500' : 'text-black'}`}
      >
        Мои заявки на бронирование
      </span>
      <Switch checked={checked} onChange={onChange} />
      <span className={`font-bold ${checked ? 'text-blue-500' : 'text-black'}`}>
        История
      </span>
    </div>
  );
}

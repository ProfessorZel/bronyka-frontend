import { dateTimeFormatter } from '@/app/shared/utils';
import { useMeetingRoomReservation } from '@/features/meeting_rooms/hooks/useMeetingRoomReservation';
import type { Reservation } from '@/features/meeting_rooms/types';
import { Collapse, CollapseProps, Drawer, Empty, Switch } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ReservationListItem } from './ReservatuinsListItem';
interface HistoryToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
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

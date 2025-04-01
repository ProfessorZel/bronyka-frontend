import { useApi } from '@/app/shared/api/useApi';
import { RESERVATIONS_API } from '@/app/shared/constants';
import { dateTimeFormatter } from '@/app/shared/utils';
import { useMeetingRooms } from '@/features/meeting_rooms/hooks/useMeetingRooms';
import { Reservation } from '@/features/meeting_rooms/types';
import { Button, FloatButton, List, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { mutate } from 'swr';
import { useOwnReservations } from '../hooks/useOwnReservations';
FloatButton;

interface HistoryToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

type ListItemList = Reservation & { name: string };

const df = dateTimeFormatter;

export function OwnReservationsList() {
  const [history, setHistory] = useState<boolean>(false);
  const [listItems, setListItems] = useState<ListItemList[]>([]); // TODO: use [listItems

  const reservations = useOwnReservations(history);
  const rooms = useMeetingRooms();

  useEffect(namingRooms, [reservations, rooms]);

  return (
    <div className="h-auto w-full overflow-y-auto">
      <ListHeader checked={history} onChange={setHistory} />
      <div className="w-full h-full">
        <List
          className="w-full bg-white"
          bordered
          dataSource={listItems}
          renderItem={ListItem}
        />
      </div>
    </div>
  );

  function namingRooms() {
    if (!reservations || !rooms) return;

    const dictRoomsName: Record<number, string> = {};

    rooms.forEach(({ id, name }) => (dictRoomsName[id] = name));

    const namedRooms: ListItemList[] = reservations.map((r) => ({
      ...r,
      name: dictRoomsName[r.meetingroom_id],
    }));

    setListItems(namedRooms);
  }
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

function ListItem({ from_reserve, to_reserve, name, id }: ListItemList) {
  const datetime = `${df(from_reserve)} - ${df(to_reserve)}`;
  const api = useApi();

  return (
    <List.Item>
      <div
        className="w-full flex flex-row justify-between items-center"
        style={{ padding: 10 }}
      >
        <div className="grid grid-rows-2">
          <p className="font-semibold">
            <span className="font-extrabold">Рабочее место:</span> {name}
          </p>
          <p className="font-semibold">
            <span className="font-extrabold">Дата:</span> {datetime}
          </p>
        </div>
        <Button
          color="red"
          variant="solid"
          icon={<MdDelete />}
          onClick={handleDeleteReservation}
          shape="circle"
        />
      </div>
    </List.Item>
  );

  async function handleDeleteReservation() {
    try {
      await api.delete(`${RESERVATIONS_API}/${id}`);
    } catch (e) {
      console.log(e);
    } finally {
      await mutate(() => true, undefined, { revalidate: true });
    }
  }
}

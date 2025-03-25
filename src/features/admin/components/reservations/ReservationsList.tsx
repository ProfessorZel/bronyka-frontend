import { useApi } from "@/app/shared/api/useApi";
import { MEETING_ROOMS_API, RESERVATIONS_API } from "@/app/shared/constants";
import { dateTimeFormatter } from "@/app/shared/utils";
import { useMeetingRoomReservation } from "@/features/meeting_rooms/hooks/useMeetingRoomReservation";
import type { Reservation } from "@/features/meeting_rooms/types";
import { Button, Collapse, DatePicker, Drawer, Form, Switch } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router";
import { mutate } from "swr";

interface HistoryToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface ReservationFormData {
  from: Date;
  to: Date;
}

export function ReservationList() {
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const reservations = useMeetingRoomReservation(showHistory);

  const handleDrawerClose = () => navigate("/admin/rooms");
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

function ReservationCollapse({ items }: { items: ItemType[] }) {
  return (
    <div className="w-full h-auto overflow-y-auto">
      <Collapse items={items as any[]} />
    </div>
  );
}

function ReservationListItem(reservation: Reservation) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const api = useApi();
  return (
    <div className="flex flex-col gap-5">
      <span>User ID: {reservation.user_id}</span>
      <span>Room ID: {reservation.meetingroom_id}</span>
      {!isEdit && (
        <>
          <Button
            onClick={() => {
              setIsEdit(true);
            }}
          >
            Редатировать дату и время
          </Button>
          <Button onClick={handleDeleteReservation}>Удалить</Button>
        </>
      )}
      {isEdit && <ReservationDTChangeForm {...reservation} />}
    </div>
  );

  async function handleDeleteReservation() {
    try {
      const id = reservation.id;

      if (!id) return;
      const res = await api.delete<Reservation>(
        `${RESERVATIONS_API}/${reservation.id}`
      );

      const reservationData = res.data;

      await mutateSwrReservationCache(reservationData);
    } catch (e) {
      console.log(e);
    }
  }
}

function ReservationDTChangeForm({ from_reserve, to_reserve }: Reservation) {
  const [reservationForm, _] = useState<ReservationFormData>({
    from: new Date(from_reserve),
    to: new Date(to_reserve),
  });

  return (
    <Form>
      <Form.Item label="От">
        <DatePicker value={dayjs(reservationForm.from)} showTime />
      </Form.Item>
      <Form.Item label="До">
        <DatePicker value={dayjs(reservationForm.to)} showTime />
      </Form.Item>
      <Button>Сохранить</Button>
      <Button>Отмена</Button>
    </Form>
  );
}

function transformReservationsToCollapseItems(
  reservations: Reservation[]
): ItemType[] {
  return reservations.map((reservation) => ({
    key: reservation.id,
    label: `${dateTimeFormatter(
      reservation.from_reserve
    )} - ${dateTimeFormatter(reservation.to_reserve)}`,
    children: <ReservationListItem {...reservation} />,
    showArrow: false,
  }));
}

async function mutateSwrReservationCache(reserv?: Reservation) {
  if (!reserv) return;

  await mutate(
    `${MEETING_ROOMS_API}/${reserv.meetingroom_id}/reservations`,
    (data?: Reservation[]) => {
      if (!data) return data;
      return data.filter((item) => item.id !== reserv.id);
    },
    {
      revalidate: false,
    }
  );
}

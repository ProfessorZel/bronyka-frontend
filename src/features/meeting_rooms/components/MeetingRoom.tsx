import { List, Typography } from "antd";
import { useMeetingRoomReservation } from "../hooks/useMeetingRoomReservation";
import { ReservationForm } from "./ReservationForm";

const listStyles = {
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 20,
  paddingBottom: 100,
};

export function MeetingRoom() {
  const reservation = useMeetingRoomReservation();
  return (
    <div
      style={listStyles}
      className="overflow-y-auto h-full w-full flex flex-col gap-10"
    >
      <ReservationForm />
      <List
        className="bg-white"
        header={<div className="text-xl">Ближайшие даты бронирования</div>}
        bordered
        dataSource={reservation}
        renderItem={(r) => (
          <List.Item>
            <Typography.Text className="text-l font-bold">
              {dateTimeFormatter(r.from_reserve)} -
              {dateTimeFormatter(r.to_reserve)}
            </Typography.Text>
          </List.Item>
        )}
      />
    </div>
  );
}

function dateTimeFormatter(dtString: string) {
  const dt = new Date(dtString);
  return new Intl.DateTimeFormat("ru", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(dt);
}

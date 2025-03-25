import { useMeetingRooms } from "@/features/meeting_rooms/hooks/useMeetingRooms";
import { Button, List, Typography } from "antd";
import { IoIosAddCircleOutline } from "react-icons/io";
import { Outlet, useNavigate } from "react-router";
import { RoomsListItem } from "./RoomsListItem";

export function RoomsList() {
  const nav = useNavigate();
  const rooms = useMeetingRooms();

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <Button
        shape="round"
        icon={<IoIosAddCircleOutline />}
        className="w-50"
        size="middle"
        type="primary"
        onClick={() => nav("new")}
      >
        Создать рабочее место
      </Button>
      <Typography.Title level={5}>Рабочие места:</Typography.Title>
      <div
        className="w-full h-auto overflow-y-auto"
        style={{ paddingBottom: 100 }}
      >
        <List
          className="bg-white  rounded-md"
          style={{ padding: 10 }}
          dataSource={rooms}
          renderItem={(room) => <RoomsListItem {...room} />}
        />
      </div>
      <Outlet />
    </div>
  );
}

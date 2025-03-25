import { useApi } from "@/app/shared/api/useApi";
import { MEETING_ROOMS_API } from "@/app/shared/constants";
import { userConfirmAction } from "@/app/shared/utils";
import { MeetingRoom } from "@/features/meeting_rooms/types";
import { Button, List } from "antd";
import { MdDelete, MdEdit } from "react-icons/md";
import { useNavigate } from "react-router";

export function RoomsListItem({ id, description, name }: MeetingRoom) {
  const nav = useNavigate();
  const api = useApi();

  return (
    <List.Item
      style={{ padding: 10 }}
      className="flex flex-row justify-start items-center hover:border-none hover:bg-gray-100 duration-200"
    >
      <div className="grid grid-flow-col grid-cols-[50px_1fr_2fr] w-full">
        <span>{id}</span>
        <span className="truncate">{name}</span>
        <span className="truncate">{description}</span>
      </div>

      <div className="flex flex-row gap-5">
        <Button
          onClick={handleDeleteRoom}
          icon={<MdDelete />}
          shape="circle"
          title="Удалить"
        />
        <Button
          icon={<MdEdit />}
          onClick={() => nav(`edit/${id}`)}
          shape="circle"
          title="Редактировать"
        />
      </div>
    </List.Item>
  );

  async function handleDeleteRoom() {
    try {
      if (!id) return;

      const confirm = userConfirmAction(`Удалить рабочее место ${name}`);

      if (!confirm) return;

      const response = await api.delete(`${MEETING_ROOMS_API}/${id}`);
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  }
}

import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";
import { useApi } from "@/app/shared/api/useApi";
import { MEETING_ROOMS_API } from "@/app/shared/constants";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import { MeetingRoom } from "@/features/meeting_rooms/types";
import { Button, Drawer, Form, Input } from "antd";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { mutate } from "swr";
import { useRoom } from "../../hooks/useRoom";
import { isFormValid } from "../../utils";

type AddRoomFormData = Omit<MeetingRoom, "id">;

const defaultAddRoomFormData: AddRoomFormData = {
  name: "",
  description: "",
};

export function AddRoomFrom() {
  const { roomId } = useParams();
  const nav = useNavigate();
  const { send, ctx } = useNotifications();
  const { post, patch } = useApi();

  const initFormData = useRoom(roomId);

  const [formData, setFormData] = useState<AddRoomFormData>(
    defaultAddRoomFormData
  );

  useEffect(() => {
    if (initFormData) setFormData({ ...initFormData });
  }, [initFormData]);

  const set = (attrs: Partial<AddRoomFormData>) => {
    setFormData({ ...formData, ...attrs });
  };

  const isEditMode = !!roomId;
  const title = isEditMode
    ? "Редактировать рабочее место"
    : "Создать новое рабочее место";

  return (
    <Drawer title={title} size="large" onClose={() => nav("/admin/rooms")} open>
      <Form labelWrap onSubmitCapture={handleCreateRoom} labelCol={{ span: 3 }}>
        <Form.Item label="Наизвание">
          <Input
            onChange={handleInputChange("name")}
            value={formData.name}
            type="text"
          />
        </Form.Item>
        <Form.Item label="Описание">
          <Input
            onChange={handleInputChange("description")}
            value={formData.description}
            type="text"
          />
        </Form.Item>
        <Button
          disabled={!isEditMode ? !isFormValid(formData) : false}
          shape="round"
          htmlType="submit"
          type="primary"
        >
          {isEditMode ? "Сохранить" : "Создать"}
        </Button>
      </Form>
      {ctx}
    </Drawer>
  );

  async function handleCreateRoom() {
    try {
      const res =
        !isEditMode && isFormValid(formData)
          ? await post<MeetingRoom>(`${MEETING_ROOMS_API}/`, formData)
          : await patch<MeetingRoom>(
              `${MEETING_ROOMS_API}/${roomId}`,
              formData
            );

      const roomData = res.data;

      mutateSwrRoomsCache(roomData, !isEditMode && isFormValid(formData));
    } catch (e) {
      const err = e as AxiosError;

      if (err.status === 422) {
        const errHasData = err as AxiosError & {
          data: ResponseApiUnprocessableEntity;
        };
        const errorMessages = errHasData.data.detail.flatMap(({ msg }) =>
          msg ? [msg] : []
        );

        send("error", errorMessages);
      } else {
        send("error", ["An unexpected error occurred"]);
        console.error("Reservation error:", err);
      }
    }
  }

  function handleInputChange(key: keyof typeof formData) {
    return function (e: React.ChangeEvent<HTMLInputElement>) {
      set({ [key]: e.target.value });
    };
  }
}

async function mutateSwrRoomsCache(room?: MeetingRoom, create: boolean = true) {
  if (!room) return;

  await mutate(
    MEETING_ROOMS_API,
    (data?: MeetingRoom[]) => {
      if (!data) return data;
      if (create) return [...data, room];
      return data.map((item) => (item.id === room.id ? room : item));
    },
    {
      revalidate: false,
    }
  );
}

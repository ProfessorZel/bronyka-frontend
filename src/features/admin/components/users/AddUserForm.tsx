import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";
import { useApi } from "@/app/shared/api/useApi";
import { AUTH_API, USERS_API } from "@/app/shared/constants";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import {
  Button,
  Checkbox,
  CheckboxChangeEvent,
  Drawer,
  Form,
  Input,
} from "antd";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { mutate } from "swr";
import { useUser } from "../../hooks/useUser";
import { User } from "../../types";
import { isFormValid } from "../../utils";

type AddUserFormData = Omit<User, "id">;

const defaultAddUserFormData: AddUserFormData = {
  fio: "",
  is_active: true,
  is_superuser: false,
  is_verified: true,
  birthdate: new Date().toISOString().split("T")[0],
  email: "",
  password: "",
};

export function AddUserForm() {
  const { userId } = useParams();
  const { post, patch } = useApi();
  const nav = useNavigate();
  const { send, ctx } = useNotifications();

  const initFormData = useUser(userId ? parseInt(userId) : undefined);

  const [formData, setFormData] = useState<AddUserFormData>(
    defaultAddUserFormData
  );

  useEffect(() => {
    if (initFormData) setFormData({ ...initFormData });
  }, [initFormData]);

  const set = (attrs: Partial<AddUserFormData>) => {
    setFormData({ ...formData, ...attrs });
  };

  const isEditMode = !!userId;
  const title = isEditMode
    ? "Редактировать пользователя"
    : "Создать пользователя";

  return (
    <Drawer title={title} size="large" onClose={() => nav("/admin/users")} open>
      <Form labelWrap onSubmitCapture={handleCreateUser} labelCol={{ span: 3 }}>
        <Form.Item label="ФИО">
          <Input
            onChange={handleInputChange("fio")}
            value={formData.fio}
            type="text"
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            onChange={handleInputChange("email")}
            value={formData.email}
            title="email"
          />
        </Form.Item>
        <Form.Item label="Пароль">
          <Input
            onChange={handleInputChange("password")}
            value={formData.password}
            type="text"
          />
        </Form.Item>
        <Form.Item label="Админ">
          <Checkbox
            onChange={handleCheckboxChange}
            value={formData.is_superuser}
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

  function handleInputChange(key: keyof typeof formData) {
    return function (e: React.ChangeEvent<HTMLInputElement>) {
      set({ [key]: e.target.value });
    };
  }

  function handleCheckboxChange(e: CheckboxChangeEvent) {
    set({ is_superuser: e.target.value });
  }

  async function handleCreateUser() {
    try {
      !isEditMode && isFormValid(formData)
        ? await post<User>(`${AUTH_API}/register`, formData)
        : await patch<User>(`${USERS_API}/${userId}`, formData);

      await mutate(() => true, undefined, {
        revalidate: true,
      });

      nav("/admin/users");
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
        send("error", ["Произошла непредвиденная ошибка"]);
      }
    }
  }
}

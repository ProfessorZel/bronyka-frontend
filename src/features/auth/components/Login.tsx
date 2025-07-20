import { CircleLoading } from "@/app/shared/animatedcomponents/CircleLoading";
import { AUTH_API } from "@/app/shared/constants";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import { Button, Card, Form, Input, Typography } from "antd";
import axios, { AxiosError } from "axios";
import { ChangeEvent, useState } from "react";

interface LoginData {
  username: string;
  password: string;
}

interface ResponseData {
  token_type: string;
  access_token: string;
}

interface LoginProps {
  saveSession: (token: string) => void;
}

const DEFAULT_LOGIN_DATA: LoginData = {
  username: "",
  password: "",
};

const useLoginForm = (initialData: LoginData) => {
  const [form, setForm] = useState<LoginData>(initialData);

  const updateField =
    (field: keyof LoginData) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return { form, updateField };
};

export function Login({ saveSession }: LoginProps) {
  const { form, updateField } = useLoginForm(DEFAULT_LOGIN_DATA);
  const [loading, setLoading] = useState(false);
  const { send, ctx } = useNotifications();

  const handleLogin = async () => {
    const { username, password } = form;

    if (!username || !password) {
      console.error("Username and password are required");
      if (!username && password) {
         send('error', ['Заполните поле Логин!']);
      } else if (!password && username) {
         send('error', ['Заполните поле Пароль!']);
      } else {
         send('error', ['Заполните поля Логин и Пароль!']);
      }
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    setLoading(true);
    try {
      const response = await axios.post<ResponseData>(
        `${AUTH_API}/jwt/login`,
        formData
      );

      if (response.status === 200) {
        const { access_token } = response.data;
        saveSession(access_token);
      }
    } catch (error) {
      console.error("Login failed:", (error as AxiosError).message);
      if ((error as AxiosError).status) {
        send('error', ['Неправильный логин или пароль! Проверьте введённые Вами данные!']);
      } else {
        send('error', ['Непредвидинная ошибка сервера']);
      }
    } finally {
      setLoading(false);
    }
  };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-xl shadow-lg">
                <Typography.Title level={2} className="text-center mb-8">
                    {!loading? "Добро пожаловать": "Производиться вход..."}
                </Typography.Title>
                {!loading? null: <Typography.Title level={4} className="text-center mb-8">
                    Подождите немного
                </Typography.Title>}
                {!loading? <> 
                    <Form layout="vertical" onFinish={handleLogin}>
                        <Form.Item
                            label="Логин"
                            rules={[{ required: true, message: "Please enter your username" }]}
                        >
                            <Input
                            value={form.username}
                            onChange={updateField("username")}
                            placeholder="Введите логин"
                            size="large"
                            className="w-full"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Пароль"
                            rules={[{ required: true, message: "Please enter your password" }]}
                        >
                            <Input.Password
                            value={form.password}
                            onChange={updateField("password")}
                            placeholder="Введите пароль"
                            size="large"
                            className="w-full"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Войти
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            :
                <CircleLoading />
            }
            </Card>
            {ctx}
        </div>
    );
}

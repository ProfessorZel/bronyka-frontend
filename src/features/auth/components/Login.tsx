import { AUTH_API } from "@/app/shared/constants";
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

  const handleLogin = async () => {
    const { username, password } = form;

    if (!username || !password) {
      console.error("Username and password are required");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl shadow-lg">
        <Typography.Title level={2} className="text-center mb-8">
          Welcome Back
        </Typography.Title>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input
              value={form.username}
              onChange={updateField("username")}
              placeholder="Enter your username"
              size="large"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              value={form.password}
              onChange={updateField("password")}
              placeholder="Enter your password"
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

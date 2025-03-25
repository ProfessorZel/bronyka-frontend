import { notification } from "antd";

type NotificationType = "success" | "error";

export function useNotifications() {
  const [notificationApi, ctx] = notification.useNotification();

  function send(type: NotificationType, messages: string[]) {
    messages.forEach((message) => notificationApi[type]({ message }));
  }

  return {
    send,
    ctx,
  };
}

import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";
import { useApi } from "@/app/shared/api/useApi";
import { RESERVATIONS_API } from "@/app/shared/constants";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import { Button, Card, DatePicker, Form } from "antd";
import { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { useParams } from "react-router";
import { mutate } from "swr";
import { Reservation } from "../types";

interface ReservationFormData {
  from: Date;
  to: Date;
}

const from = new Date();
const to = new Date(from.getTime() + 60 * 60 * 1000);

const defaultReservationFormData: ReservationFormData = {
  from,
  to,
};

export function ReservationForm() {
  const api = useApi();
  const { roomId } = useParams();
  const [reservationForm, setReservationForm] = useState<ReservationFormData>(
    defaultReservationFormData
  );
  const { send, ctx } = useNotifications();

  const set = (attrs: Partial<ReservationFormData>) => {
    setReservationForm({ ...reservationForm, ...attrs });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Оформить бронирование">
        <Form onSubmitCapture={handleReservation}>
          <Form.Item>
            <div className="flex flex-col gap-6">
              <DatePicker
                showTime
                value={dayjs(reservationForm.from)}
                onChange={(_: Dayjs, dateStr: string | string[]) => {
                  const newDT = new Date(dateStr as string);
                  set({ from: newDT });
                }}
              />
              <DatePicker
                showTime
                value={dayjs(reservationForm.to)}
                onChange={(_: Dayjs, dateStr: string | string[]) => {
                  const newDT = new Date(dateStr as string);
                  set({ to: newDT });
                }}
              />
            </div>
          </Form.Item>
          <Button shape="round" type="primary" htmlType="submit">
            Заявка на бронирование
          </Button>
        </Form>
      </Card>
      {ctx}
    </div>
  );

  async function handleReservation() {
    const { from, to } = reservationForm;

    if (from >= to) {
      send("error", ["Invalid date and time range for reservation"]);
      return;
    }

    const payload = {
      from_reserve: toNaiveISOString(from),
      to_reserve: toNaiveISOString(to),
      meetingroom_id: roomId,
    };

    try {
      const res = await api.post<Reservation>(RESERVATIONS_API, payload);

      if (res.status === 200) {
        mutate(() => true, undefined, { revalidate: true });
        return res.data;
      }
    } catch (error) {
      const err = error as AxiosError;

      if (err.status === 422) {
        const errHasData = err as AxiosError & {
          data: ResponseApiUnprocessableEntity;
        };

        if (Array.isArray(errHasData.data.detail)) {
          const errorMessages = errHasData.data.detail
            .flatMap(({ msg }) => (msg ? [msg] : []))
            .filter(Boolean);

          send("error", errorMessages);
        }

        if (typeof errHasData.data.detail === "string") {
          send("error", [errHasData.data.detail]);
        }
      } else {
        send("error", ["Произошла непредвиденная ошибка"]);
      }
    }
  }
}

function toNaiveISOString(date: Date) {
  return date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
}

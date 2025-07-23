import { Reservation } from "@/features/meeting_rooms/types";
import { Modal, Form, DatePicker, Button } from "antd";
import { MouseEventHandler, useState } from "react";
import dayjs from 'dayjs';
import { userConfirmAction } from "./utils";
import { MEETING_ROOMS_API, RESERVATIONS_API } from "./constants";
import { useApi } from "./api/useApi";
import { AxiosError } from "axios";
import { ResponseApiUnprocessableEntity } from "./api/types";
import { useNotifications } from "./hooks/useNotifications";
import { mutate } from "swr";

interface MyModalProps {
    isCreate: boolean;
    isModalOpen: boolean;
    handleOk: () => void;
    handleCancel: MouseEventHandler;
    handelDelete: () => void;
    reservForm: Reservation;
}

export function DataModal({ isCreate, isModalOpen, handleOk, handleCancel, handelDelete, reservForm }: MyModalProps) {
    const [ reservationForm, setReservationForm ] = useState<Reservation>(reservForm);
    console.log(reservationForm);
    const [ loading, setLoading ] = useState(false);
    const api = useApi();
    const { send, ctx } = useNotifications();

    function hOk() {
        setLoading(true);
        setTimeout(() => {
            setLoading(false)
            handleOk();
        }, 500);
    }

    function hDelete() {
        handelDelete();
    }

    return(
        <Modal
            title="Создать бронь"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isModalOpen}
            onOk={hOk}
            onCancel={handleCancel}
            footer={[
                !isCreate? <Button 
                        key="delete"
                        type="dashed"
                        danger
                        onClick={hDelete}
                    >
                        Удалить
                    </Button>
                : null,
                <Button key="cancel" onClick={handleCancel}>
                    Отмена
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={hOk}
                >
                    Забронировать
                </Button>,
            ]}
        >
            <Form>
                <Form.Item label="От">
                    <DatePicker
                    value={dayjs(reservationForm.from_reserve)}
                    showTime={{
                        minuteStep: 10,
                        showHour: true,
                        showMinute: true,
                    }}
                    onChange={(_, dateStr) =>
                        setReservationForm({
                        ...reservationForm,
                        from_reserve: String(new Date(dateStr as string)),
                        })
                    }
                    allowClear={false}
                    />
                </Form.Item>
                <Form.Item label="До">
                    <DatePicker
                    showTime={{
                        minuteStep: 10,
                        showHour: true,
                        showMinute: true,
                    }}
                    value={dayjs(reservationForm.to_reserve)}
                    onChange={(_, dateStr) => 
                        setReservationForm({
                        ...reservationForm,
                        to_reserve: String(new Date(dateStr as string)),
                        })
                    }
                    allowClear={false}
                    />
                </Form.Item>
            </Form>
            {ctx}        
      </Modal>
    );

    async function handleDeleteReservation(id?: number) {
        try {
            const confirm = userConfirmAction(`Удалить заявку на бронирование`);
            if (!confirm) return;
            const res = await api.delete<Reservation>(`${RESERVATIONS_API}/${id}`);
        
            mutateCalendarEvents(res.data, 0);
        
            send('success', ['Заявка на бронирование успешно удалена!']);
        } catch (e) {
            errorHandler(e);
        }
    }
        
    function errorHandler(error: any) {
        const err = error as AxiosError;
        
        if (err.status === 422) {
            const errHasData = err as AxiosError & {
            data: ResponseApiUnprocessableEntity;
            };
        
            if (Array.isArray(errHasData.data.detail)) {
            const errorMessages = errHasData.data.detail
                .flatMap(({ msg }) => (msg ? [msg] : []))
                .filter(Boolean);
        
            send('error', errorMessages);
            }
        
            if (typeof errHasData.data.detail === 'string') {
            send('error', [errHasData.data.detail]);
            }
        } else {
            send('error', ['Произошла непредвиденная ошибка']);
        }
    }
}

async function mutateCalendarEvents(event: Reservation, roomId?: number) {
  if (!event) return;

  mutate(
    `${MEETING_ROOMS_API}/${roomId}/reservations?history=false`,
    (data?: Reservation[]) => {
      if (!data) return data;

      return data.map((item) => (item.id === event.id? event: item));
    },
    {
      revalidate: true
    }
  );
}
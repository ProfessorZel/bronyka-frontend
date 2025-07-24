import { MeetingRoom, Reservation } from "@/features/meeting_rooms/types";
import { Modal, Form, DatePicker, Button, Select } from "antd";
import { MouseEventHandler, useState } from "react";
import dayjs from 'dayjs';
import { useMeetingRooms } from "@/features/meeting_rooms/hooks/useMeetingRooms";
import { BigCalendarEvent } from "./BigCalendarReservations";
import { InputStatus } from "antd/es/_util/statusUtils";
import { CircleLoading } from "./animatedcomponents/CircleLoading";

interface MyModalProps {
    isCreate: boolean;
    isModalOpen: boolean;
    handleOk: () => void;
    handleCancel: MouseEventHandler;
    handelDelete: () => void;
    handelSetReserv: (e: Reservation) => void;
    reservationForm: Reservation;
    handleReservation: (e: BigCalendarEvent, k: boolean) => void;
    handleDeleteReservation: (e: number) => void;
}

export function DataModal({
    isCreate,
    isModalOpen,
    handleOk,
    handleCancel,
    handelDelete,
    handelSetReserv,
    reservationForm,
    handleReservation,
    handleDeleteReservation,
}: MyModalProps) {
    const [ loading, setLoading ] = useState(false);
    const [ selectStatus, setSelectStatus ] = useState<InputStatus>("");
    const meetingrooms = isCreate? useMeetingRooms(): undefined;

    async function hOk() {
        if (reservationForm.meetingroom.name === 'Выберите комнату') {
            setSelectStatus('error');
        } else {
            setLoading(true);
            await handleReservation({
                    title: reservationForm.meetingroom.name,
                    start: new Date(reservationForm.from_reserve),
                    end: new Date(reservationForm.to_reserve),
                    allDay: false,
                    resource: {...reservationForm}
                },
                isCreate
            );
            setLoading(false)
            handleOk();
        }
    }

    async function hDelete() {
        setLoading(true);
        await handleDeleteReservation(reservationForm.id);
        handelDelete();
        setLoading(false);
    }

    return(
        <>
        <Modal
            title="Создать бронь"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isModalOpen}
            footer={!loading? 
                [!isCreate?
                    <Button 
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
                    onClick={hOk}
                >
                    Забронировать
                </Button>,]
            : []}
        >
            {!loading?
                <Form className="flex flex-col">
                    {isCreate &&
                        <Form.Item>
                            <div className="flex flex-col gap-2">
                                <span>Комната:</span>
                                <Select
                                    defaultValue={reservationForm.meetingroom.name}
                                    status={selectStatus}
                                    onChange={(value) => {
                                        let room: MeetingRoom = {id: 1, name: '', description: ''};
                                        if (meetingrooms) {
                                            meetingrooms.map((e) => {
                                                if (e.name === value) {
                                                    room = e;
                                                }
                                            });
                                        }
                                        setSelectStatus("");
                                        handelSetReserv({
                                            ...reservationForm,
                                            meetingroom: room,
                                            meetingroom_id: room.id
                                        });
                                    }}
                                >
                                    {meetingrooms? meetingrooms.map((room) => {
                                        return(
                                            <Select.Option value={room.name}>{room.name}</Select.Option>
                                        );
                                    }): null}
                                </Select>
                            </div>
                        </Form.Item>
                    }
                    <Form.Item>
                        <div className="flex flex-col gap-2">
                            <span>От:</span>
                            <DatePicker
                            value={dayjs(reservationForm.from_reserve)}
                            showTime={{
                                minuteStep: 10,
                                showHour: true,
                                showMinute: true,
                            }}
                            onChange={(_, dateStr) => {
                                handelSetReserv({
                                    ...reservationForm,
                                    from_reserve: String(new Date(dateStr as string)),
                                });
                            }}
                            allowClear={false}
                            />
                        </div>
                    </Form.Item>
                    <Form.Item>
                        <div className="flex flex-col gap-2">
                            <span>До:</span>
                            <DatePicker
                            showTime={{
                                minuteStep: 10,
                                showHour: true,
                                showMinute: true,
                            }}
                            value={dayjs(reservationForm.to_reserve)}
                            onChange={(_, dateStr) => {
                                handelSetReserv({
                                    ...reservationForm,
                                    to_reserve: String(new Date(dateStr as string)),
                                });
                            }}
                            allowClear={false}
                            />
                        </div>
                    </Form.Item>
                </Form>
            : <CircleLoading />}
        </Modal>
        </>   
    );
}
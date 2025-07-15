import { ReservationDatetimeForm } from "@/features/admin/components/reservations/ReservationDatetimeForm";
import { Reservation } from "@/features/meeting_rooms/types";
import { Button } from "antd";
import { useState } from "react";
import { MdEdit } from "react-icons/md";

export function EditReservationForm(reservat: Reservation) {
    const [ isEdit, setIsEdit ] = useState<boolean>(false);

    function canselEdit() {
        setIsEdit(false);
    }
    
    return(
        <>
            {!isEdit ?
                <Button
                // shape='circle'
                icon={<MdEdit />}
                onClick={() => {setIsEdit(true)}}
                >Изменить дату и время</Button>
                : <ReservationDatetimeForm cancel={canselEdit} {...reservat}/>
            }
        </>
    );
}
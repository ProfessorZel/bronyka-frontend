import { List, Button, Input } from "antd";
import { ChangeEventHandler, MouseEventHandler, ReactNode } from "react";
import { useMeetingRooms } from "@/features/meeting_rooms/hooks/useMeetingRooms";
import { MeetingRoom } from "@/features/meeting_rooms/types";

type Props = {
   roomId: number;
   inGroup: boolean;
   icon: ReactNode;
   inputValue: number;
   change: MouseEventHandler;
   reservChange: ChangeEventHandler;
}

export function RoomsListForForm({ roomId, inGroup, icon, inputValue, change, reservChange }: Props) {
   const rooms = useMeetingRooms();
   let room: MeetingRoom | undefined;
   Object.values(rooms).map(item => {if (item.id==roomId) room = item;});

   return(
      <div className="w-full h-full overflow-auto" style={{ padding: 5 }}>
         <List.Item
            style={{ padding: 0 }}
            className="flex flex-row justify-start items-center"
         >
            <div className="w-[100%] ant-col flex flex-col justify-between items-start gap-2">
               {room? <span>{room.name}</span>: null}
               {inGroup && room? 
                  <>
                     <span>Максимальное время резервирования(в днях):</span>
                     <Input
                        onChange={reservChange}
                        value={inputValue}
                        type="number"
                        id={String(roomId)}
                     ></Input>
                  </>
               : null}
               <Button
                  onClick={change}
                  icon={icon}
                  shape="round"
               >
                  {inGroup? 'Удалить комнату': 'Добавить комнату'}
               </Button>
            </div>
         </List.Item>         
      </div>
   );
}
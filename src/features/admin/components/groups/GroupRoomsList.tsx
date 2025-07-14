import { List } from "antd";
import { permissionsType } from "../../types";
import { useMeetingRooms } from "@/features/meeting_rooms/hooks/useMeetingRooms";
import { MeetingRoom } from "@/features/meeting_rooms/types";

export function GroupRoomsList({meetingroom_id, max_future_reservation}: permissionsType) {
   const rooms = useMeetingRooms();
   let room: MeetingRoom | undefined;
   Object.values(rooms).map(item => { if (item.id==meetingroom_id) room = item});

   return(
      <div className="w-full h-full overflow-auto">
         <List.Item
            style={{ padding: 0 }}
            className="flex flex-row justify-start items-center"
         >
            <div className="w-[100%] flex flex-row justify-start items-start gap-5">
               {room? 
                  <span>{room.name}</span>
               : null}
               <span>{`Максимальное время резервирования: ${parseData(max_future_reservation)}`}</span>
            </div>
         </List.Item>         
      </div>
   );

   function parseData(data: string): string {
      let dat: string[] = data.split(' ');
      let result: string = '';

      if (dat.length > 1) {
         if (parseInt(dat[0]) > 10 && parseInt(dat[0]) < 21) {
            result = `${dat[0]} дней`;
         } else {
            switch(parseInt(dat[0][dat[0].length-1])) {
               case 1: { result = `${dat[0]} день`; break; };
               case 2: { result = `${dat[0]} дня`; break; };
               case 3: { result = `${dat[0]} дня`; break; };
               case 4: { result = `${dat[0]} дня`; break; };
               default: { result = `${dat[0]} дней`; break }
            }
         }
      } else {
         result = '0 дней'
      }

      return result; //пока возвращает только дни надо будет доделать для формата 00:00:00
   }
}
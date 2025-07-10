import { List } from "antd";
import { permissionsType } from "../../types";
import { useMeetingRooms } from "@/features/meeting_rooms/hooks/useMeetingRooms";

export function GroupRoomsList({meetingroom_id}: permissionsType) {
   const rooms = useMeetingRooms();
   const room = Object.values(rooms)[meetingroom_id-1];

   return(
      <div className="w-full h-full overflow-auto">
         <List.Item
            style={{ padding: 0 }}
            className="flex flex-row justify-start items-center"
         >
            <div className="w-[100%] flex flex-row justify-between items-center gap-5">
               <span>{room.name}</span>
            </div>
         </List.Item>         
      </div>
   );
}
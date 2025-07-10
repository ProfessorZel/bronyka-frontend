import { GROUPS_API } from "@/app/shared/constants";
import useSWR from "swr";
import { GroupRooms, permissionsType } from "../types";

export function useGroupRooms(id: number) {
   const { data } = useSWR<GroupRooms[]>(`${GROUPS_API}/${id}`); // Без axios.get

   let rooms: permissionsType[] = [];
   let room: permissionsType = {
      max_future_reservation: '0',
      meetingroom_id: 0,
   };

   if (data) {
      const groupRooms = Object.values(data).pop();
      
      if (groupRooms) {
         Object.values(groupRooms).forEach(el => {
            room.max_future_reservation=el.max_future_reservation;
            room.meetingroom_id=el.meetingroom_id;
      
            let newroom = JSON.parse(JSON.stringify(room)) as typeof room;
            rooms.push(newroom);
         });
      }
   }

   return rooms ?? [];
}
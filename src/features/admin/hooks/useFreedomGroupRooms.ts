import useSWR from "swr";
import { Group, permissionsType } from "../types";
import { GROUPS_API, MEETING_ROOMS_API } from "@/app/shared/constants";
import { useGroupRooms } from "./useGroupRooms";
import { MeetingRoom } from "@/features/meeting_rooms/types";

export function useFreedomGroupRooms() {
   const { data } = useSWR<Group[]>(GROUPS_API); // Без axios.get
   const group = data;
   let allRooms: permissionsType[] = [];
   let freedomRooms: MeetingRoom[] = [];

   if (group) {
      group.forEach((e) => {
         const groupRooms = useGroupRooms(e.id);
         groupRooms.forEach((el) => {
            if (!allRooms.includes(el)) {
               allRooms.push(el);
            }
         });
      });
      const { data } = useSWR<MeetingRoom[]>(MEETING_ROOMS_API);
      let allRoomsId = allRooms.map(item => item.meetingroom_id);
      let allOccupideRoomsId = allRoomsId.filter((e, i) => allRoomsId.indexOf(e) === i);
      if (data) {
         data.forEach(element => {
            if (!(allOccupideRoomsId.indexOf(element.id) > -1)) {
               freedomRooms.push(element);
            }
         });
      }
   }

   return freedomRooms ?? [];
}
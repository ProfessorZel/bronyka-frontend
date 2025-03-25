import { MEETING_ROOMS_API } from "@/app/shared/constants";
import { MeetingRoom } from "@/features/meeting_rooms/types";
import useSWR from "swr";

export function useRoom(roomId?: string) {
  const { data } = useSWR<MeetingRoom>(
    roomId ? `${MEETING_ROOMS_API}/${roomId}` : null
  );

  return data;
}

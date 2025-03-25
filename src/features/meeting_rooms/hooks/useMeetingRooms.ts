import { MEETING_ROOMS_API } from "@/app/shared/constants";
import useSWR from "swr";
import { MeetingRoom } from "../types";

export function useMeetingRooms() {
  const { data } = useSWR<MeetingRoom[]>(MEETING_ROOMS_API); // Без axios.get

  return data ?? [];
}

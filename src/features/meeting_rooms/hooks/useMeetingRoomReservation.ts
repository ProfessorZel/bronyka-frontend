import { MEETING_ROOMS_API } from "@/app/shared/constants";
import { useParams } from "react-router";
import useSWR from "swr";
import { Reservation } from "../types";

export function useMeetingRoomReservation(history = false) {
  const { roomId } = useParams();
  const { data } = useSWR<Reservation[]>(
    roomId && `${MEETING_ROOMS_API}/${roomId}/reservations?history=${history}`
  );

  return data ?? [];
}

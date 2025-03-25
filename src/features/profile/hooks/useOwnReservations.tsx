import { RESERVATIONS_API } from "@/app/shared/constants";
import { Reservation } from "@/features/meeting_rooms/types";
import useSWR from "swr";

export function useOwnReservations(history = false) {
  const { data } = useSWR<Reservation[]>(
    `${RESERVATIONS_API}/my_reservations?history=${history}`
  );

  return data ?? [];
}

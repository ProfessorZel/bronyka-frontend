import { RESERVATIONS_API } from "@/app/shared/constants";
import useSWR from "swr";
import { Reservation } from "../types";

export function useMeetingRoomsReservation() {
  const { data } = useSWR<Reservation[]>(RESERVATIONS_API);

  return data ?? [];
}

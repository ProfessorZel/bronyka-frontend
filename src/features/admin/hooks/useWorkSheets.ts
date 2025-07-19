import { GOOGLE_SHEETS_API } from "@/app/shared/constants";
import { WorkSheets } from "../types";
import useSWR from "swr";

export function useWorkSheets() {
  const { data } = useSWR<WorkSheets[]>(`${GOOGLE_SHEETS_API}`);
  
  return data ?? [];
}

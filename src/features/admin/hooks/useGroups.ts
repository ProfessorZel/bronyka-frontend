import { GROUPS_API } from "@/app/shared/constants";
import useSWR from "swr";
import { Group } from "../types";

export function useGroups() {
  const { data } = useSWR<Group[]>(GROUPS_API); // Без axios.get

  return data ?? [];
}
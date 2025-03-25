import { USERS_API } from "@/app/shared/constants";
import { User } from "@/features/auth/types";
import useSWR from "swr";

export function useUsersList() {
  const { data } = useSWR<User[]>(`${USERS_API}`);
  return data ?? [];
}

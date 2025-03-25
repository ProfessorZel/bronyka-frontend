import { USERS_API } from "@/app/shared/constants";
import useSWR from "swr";
import { User } from "../types";

export function useUser(userId?: number) {
  const { data } = useSWR<User>(userId ? `${USERS_API}/${userId}` : null);

  return data;
}

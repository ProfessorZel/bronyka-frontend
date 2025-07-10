import { useEffect, useState } from "react";
import { Group } from "../types";
import useSWR from "swr";
import { GROUPS_API } from "@/app/shared/constants";

export function useGroup(groupId?: string) {
   const [group, setGroup] = useState<Group | null>(null);

   const { data } = useSWR<Group[]>(
      groupId ? `${GROUPS_API}`: null,
   );

   useEffect(() => {
      if (data && groupId) {
         const targetGroup = data.find((r) => r.id === parseInt(groupId));
         if (targetGroup) setGroup(targetGroup);
      }
   }, [data, groupId]);

   return group;
}
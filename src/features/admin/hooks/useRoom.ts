import { MEETING_ROOMS_API } from '@/app/shared/constants';
import { MeetingRoom } from '@/features/meeting_rooms/types';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export function useRoom(roomId?: string): MeetingRoom | null {
  const [room, setRoom] = useState<MeetingRoom | null>(null);

  const { data } = useSWR<MeetingRoom[]>(
    roomId ? `${MEETING_ROOMS_API}` : null,
  );

  useEffect(() => {
    if (data && roomId) {
      const targetRoom = data.find((r) => r.id === parseInt(roomId));
      if (targetRoom) setRoom(targetRoom);
    }
  }, [data, roomId]);

  return room;
}

import { AUDIT_API } from '@/app/shared/constants';
import useSWR from 'swr';
import { EventLog } from '../types';

export function useEventsLogs() {
  const { data } = useSWR<EventLog[]>(`${AUDIT_API}/events`);

  return data;
}

import { useApi } from '@/app/shared/api/useApi';
import { AUDIT_API } from '@/app/shared/constants';
import { useNotifications } from '@/app/shared/hooks/useNotifications';
import { userConfirmAction } from '@/app/shared/utils';
import { Button, Input, List } from 'antd';
import { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { mutate } from 'swr';
import { useEventsLogs } from '../../hooks/useEventsLogs';
import { EventLogItem } from './EventsLogItem';

const defaultDeletionPeriodDays = 45;

export function EventsLogs() {
  const eventsLogs = useEventsLogs();
  const { ctx, send } = useNotifications();
  const api = useApi();

  const [deletionPeriodDays, setDeletionPeriodDays] = useState<number>(
    defaultDeletionPeriodDays,
  );

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="grid grid-auto-flow gap-2">
        <Button
          color="red"
          variant="outlined"
          shape="round"
          icon={<MdDelete />}
          className="w-60"
          size="middle"
          onClick={handleOldEventsLogs}
        >
          Удалить старые события
        </Button>
        <Input
          type="number"
          prefix="Период удаления:"
          className="gap-2"
          placeholder="По умолчанию - 45 дней"
          value={deletionPeriodDays}
          onChange={handleChangeDeletionDays}
        />
      </div>

      <div className="w-full h-auto overflow-y-auto">
        <List
          className="bg-white rounded-md"
          style={{ padding: 10 }}
          dataSource={eventsLogs}
          renderItem={(logData) => <EventLogItem {...logData} />}
        />
      </div>
      {ctx}
    </div>
  );

  function handleChangeDeletionDays(e: React.ChangeEvent<HTMLInputElement>) {
    const days =
      typeof e.target.value === 'number'
        ? e.target.value ?? defaultDeletionPeriodDays
        : parseInt(e.target.value);

    setDeletionPeriodDays(days);
  }

  async function handleOldEventsLogs() {
    try {
      const currentDeletionDays =
        deletionPeriodDays || defaultDeletionPeriodDays;

      const confirm = userConfirmAction(
        `Удалить логи событий за период ${currentDeletionDays} дней`,
      );
      if (!confirm) return;

      const payload = {
        days_after: currentDeletionDays,
      };

      await api.post(`${AUDIT_API}/clear_old`, payload);

      send('success', [
        `История событий очищена за период: ${currentDeletionDays} дней`,
      ]);
    } catch (e: any) {
      send('error', [e?.message]);
    } finally {
      await mutate(() => true, undefined, { revalidate: true });
    }
  }
}

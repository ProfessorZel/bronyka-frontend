import { dateTimeFormatter } from '@/app/shared/utils';
import { List } from 'antd';
import { EventLog } from '../../types';

export type EventLogItemProps = EventLog;

export function EventLogItem({ description, user, time }: EventLogItemProps) {
  return (
    <List.Item
      style={{ padding: 10 }}
      className="flex flex-row justify-start items-center hover:border-none hover:bg-gray-100 duration-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <span>{dateTimeFormatter(time)}</span>
        <span>{user.fio}</span>
        <span>{description}</span>
      </div>
    </List.Item>
  );
}

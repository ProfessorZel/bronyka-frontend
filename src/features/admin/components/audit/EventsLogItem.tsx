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
      <div className="grid grid-flow-col-dense grid-cols-3 gap-2 w-full">
        <span>{dateTimeFormatter(time)}</span>
        <span>{user.fio}</span>
        <span>{description}</span>
      </div>
    </List.Item>
  );
}

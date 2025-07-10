import { useGroups } from '../../hooks/useGroups';
import { Button, List, Typography } from 'antd';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { Outlet, useNavigate } from 'react-router';
import { GroupListItem } from './GroupsListItem';

export function GroupsList() {
  const nav = useNavigate();
  const groups = useGroups();

  return (
    <div className="flex flex-col h-auto w-full overflow-auto">
      <Button
        shape="round"
        icon={<IoIosAddCircleOutline />}
        className="w-50"
        size="middle"
        type="primary"
        onClick={() => nav('new')}
      >
        Создать группу
      </Button>
      <Typography.Title level={5}>Группы:</Typography.Title>
      <div className="w-full h-full overflow-auto">
        <List
          className="bg-white rounded-md"
          style={{ padding: 10 }}
          dataSource={groups}
          renderItem={(group) => <GroupListItem {...group} />}
        />
      </div>
      <Outlet />
    </div>
  );
}

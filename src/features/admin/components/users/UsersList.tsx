import { Button, List, Typography } from 'antd';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { Outlet, useNavigate } from 'react-router';
import { useUsersList } from '../../hooks/useUsersList';
import { UsersListItem } from './UsersListItem';

export function UsersList() {
  const nav = useNavigate();
  const users = useUsersList();

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-auto">
      <Button
        shape="round"
        icon={<IoIosAddCircleOutline />}
        className="w-50"
        size="middle"
        type="primary"
        onClick={() => nav('new')}
      >
        Создать пользователя
      </Button>
      <Typography.Title level={5}>Пользователи:</Typography.Title>
      <div
        className="w-full h-auto overflow-y-auto"
        style={{ paddingBottom: 100 }}
      >
        <List
          className="bg-white  rounded-md"
          style={{ padding: 10 }}
          dataSource={users}
          renderItem={(user) => <UsersListItem {...user} />}
        />
      </div>
      <Outlet />
    </div>
  );
}

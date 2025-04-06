import { useApi } from '@/app/shared/api/useApi';
import { USERS_API } from '@/app/shared/constants';
import { userConfirmAction } from '@/app/shared/utils';
import { User } from '@/features/auth/types';
import { Button, List } from 'antd';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { mutate } from 'swr';

export function UsersListItem({ email, fio, id, is_superuser }: User) {
  const nav = useNavigate();
  const api = useApi();

  return (
    <List.Item
      style={{ padding: 10 }}
      className="flex flex-row justify-start items-center hover:border-none hover:bg-gray-100 duration-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <span>{id}</span>
        <span className="truncate">{fio}</span>
        <span>{!is_superuser || 'admin'}</span>
        <span>{email}</span>
      </div>

      <div className="flex flex-row gap-5">
        <Button
          onClick={handleDeleteUser}
          icon={<MdDelete />}
          shape="circle"
          title="Удалить"
        />
        <Button
          icon={<MdEdit />}
          onClick={() => nav(`edit/${id}`)}
          shape="circle"
          title="Редактировать"
        />
      </div>
    </List.Item>
  );

  async function handleDeleteUser() {
    try {
      if (!id) return;

      const confirm = userConfirmAction(`Удалить пользователя ${fio}`);

      if (!confirm) return;

      await api.delete(`${USERS_API}/${id}`);
    } catch (e) {
      console.log(e);
    } finally {
      await mutate(() => true, undefined, { revalidate: true });
    }
  }
}

import { Menu, MenuProps } from 'antd';
import { CiTimer } from 'react-icons/ci';
import { FaLaptopCode } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { GoTools, GoGraph } from 'react-icons/go';
import { useNavigate } from 'react-router';

const navMenuItems = [
  {
    label: 'Пользователи',
    key: '/admin/users',
    icon: <FiUsers />,
  },
  {
    label: 'Рабочие места',
    key: '/admin/rooms',
    icon: <FaLaptopCode />,
  },
  {
     label: 'Группы',
     key: '/admin/groups',
     icon: <GoGraph />,
   },
   {
     label: 'Автоматический табель учета рабочего времени',
     key: '/admin/spreadsheets',
     icon: <CiTimer />,
   },
   {
     label: 'Аудит системы',
     key: '/admin/audit',
     icon: <GoTools />,
   },
];

export function NavBar() {
  const nav = useNavigate();

  const handleClickMenu: MenuProps['onClick'] = (e) => nav(e.key);

  return (
    <Menu
      className="rounded-md bg-white h-full w-full"
      onClick={handleClickMenu}
      items={navMenuItems}
    />
  );
}

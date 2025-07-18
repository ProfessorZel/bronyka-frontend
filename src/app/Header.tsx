import { useSessionUser } from '@/features/auth';
import { Button } from 'antd';
import { CgProfile } from 'react-icons/cg';
import { IoHomeSharp } from 'react-icons/io5';
import { MdAdminPanelSettings } from 'react-icons/md';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/app/shared/constants';

export function Header() {
  const nav = useNavigate();
  const userData = useSessionUser();
  const { pathname } = useLocation();

  const isHomePage = pathname === '/';

  const isAdmin = userData && userData.is_superuser;

  const handleAdminPanel = () => nav('/admin/users');
  const handleUserProfile = () => nav('/profile');
  const handleUserLogOut = () => {
   localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
   location.reload();
  };

  const adminPanelNavLink = isAdmin ? (
    <Button
      onClick={handleAdminPanel}
      type="link"
      icon={<MdAdminPanelSettings />}
    >
      Панель администратора
    </Button>
  ) : null;

  return (
    <div
      className="z-50 h-auto w-full flex flex-col md:flex-row justify-between items-center bg-white p-5 box-border gap-4 md:gap-0"
      style={{ padding: 10 }}
    >
      <NavLink
        title="К списку рабочих мест"
        to="/"
        className="text-black text-xl md:text-2xl text-center md:text-left"
      >
        <div className="flex flex-row justify-start items-center gap-2">
          <Button
            icon={!isHomePage ? <IoHomeSharp size={25} /> : ''}
            type='primary'
            size='large'
          ><span style={{ fontWeight: 'bold' }}>Рабочие места</span></Button>
        </div>
      </NavLink>
      <div className="flex flex-row gap-3 md:gap-5 items-center">
        {adminPanelNavLink}
        <Button
          onClick={handleUserProfile}
          type="primary"
          size="large"
          shape="circle"
          icon={<CgProfile />}
          className="self-center"
        />
        <Button
            onClick={handleUserLogOut}
            type="primary"
            size="large"
            // icon={<CgProfile />}
            className="self-center"
         ><span style={{ fontWeight: 'bold' }}>Выйти</span></Button>
      </div>
    </div>
  );
}

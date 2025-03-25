import { useSessionUser } from "@/features/auth";
import { Button } from "antd";
import { CgProfile } from "react-icons/cg";
import { MdAdminPanelSettings } from "react-icons/md";
import { NavLink, useNavigate } from "react-router";

export function Header() {
  const nav = useNavigate();
  const userData = useSessionUser();

  const isAdmin = userData && userData.is_superuser;

  const handleAdminPanel = () => nav("/admin/users");
  const handleUserProfile = () => nav("/profile");

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
      style={{ padding: 20, boxSizing: "border-box" }}
      className="z-50 h-[56px] w-full flex flex-row justify-between items-center bg-white"
    >
      <NavLink to="/" className="text-black text-2xl">
        Рабочие места
      </NavLink>
      <div className="flex flex-row gap-5">
        {adminPanelNavLink}
        <Button
          onClick={handleUserProfile}
          type="primary"
          size="large"
          shape="circle"
          icon={<CgProfile />}
        />
      </div>
    </div>
  );
}

import { useSessionUser } from "@/features/auth";
import { Button } from "antd";
import { MdAdminPanelSettings } from "react-icons/md";
import { NavLink, Outlet, useNavigate } from "react-router";

export function AppLayout() {
  const nav = useNavigate();
  const userData = useSessionUser();

  const isAdmin = userData && userData.is_superuser;

  return (
    <div className="bg-blue-50 min-h-screen w-full flex flex-col">
      <div
        style={{ padding: 20, boxSizing: "border-box" }}
        className="z-50 h-[56px] w-full flex flex-row justify-between items-center bg-white"
      >
        <NavLink to="/" className="text-black text-2xl">
          Рабочие места
        </NavLink>
        {isAdmin && (
          <Button
            onClick={() => nav("/admin/users")}
            type="link"
            className="ml-auto mr-0"
            icon={<MdAdminPanelSettings />}
          >
            Панель администратора
          </Button>
        )}
      </div>
      <div className="flex-1 w-full">
        <Outlet />
      </div>
    </div>
  );
}

import { Menu, MenuProps } from "antd";
import { FaLaptopCode } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router";

const navMenuItems = [
  {
    label: "Пользователи",
    key: "/admin/users",
    icon: <FiUsers />,
  },
  {
    label: "Рабочие места",
    key: "/admin/rooms",
    icon: <FaLaptopCode />,
  },
];

export function NavBar() {
  const nav = useNavigate();

  const handleClickMenu: MenuProps["onClick"] = (e) => nav(e.key);

  return (
    <Menu
      className="rounded-md bg-white h-full"
      onClick={handleClickMenu}
      items={navMenuItems}
    />
  );
}

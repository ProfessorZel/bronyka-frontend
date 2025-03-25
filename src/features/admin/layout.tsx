import { Outlet } from "react-router";
import { NavBar } from "./components/NavBar";

export function AdminLayout() {
  return (
    <div className="h-full w-full flex flex-row gap-10" style={{ padding: 10 }}>
      <NavBar />
      <Outlet />
    </div>
  );
}

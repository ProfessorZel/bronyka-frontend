import { Outlet } from "react-router";

export function MeetingRoomsLayout() {
  return (
    <div className="h-[100vh] w-full">
      <Outlet />
    </div>
  );
}

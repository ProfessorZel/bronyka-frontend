import { Outlet } from 'react-router';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="bg-blue-50 h-auto w-full flex flex-col">
      <Header />
      <div className="flex-1 w-full">
        <Outlet />
      </div>
    </div>
  );
}

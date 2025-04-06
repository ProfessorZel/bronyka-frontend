import { OwnReservationsList } from './components/OwnReservations';

export function ProfileLayout() {
  return (
    <div className="h-full w-full flex flex-row gap-10" style={{ padding: 10 }}>
      <OwnReservationsList />
    </div>
  );
}

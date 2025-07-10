import { Button, Card } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useMeetingRooms } from '../hooks/useMeetingRooms';
import { MeetingRoom } from '../types';

const listStyles = {
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 20,
  paddingBottom: 0,
};

const cardClasses =
  'w-full shadow-md hover:shadow-xl transition-shadow duration-300 border-0 rounded-none';

function MeetingRoomsItem({ id, name, description }: MeetingRoom) {
   const nav = useNavigate();
   // let imageURL = description.split(';').pop();
   // description = description.split(';')[0];

   return (
      <div>
         <Card title={name} className={cardClasses}>
            <div className="flex flex-col gap-4">
               <p className="text-gray-600 line-clamp-3">{description}</p>
                  <Button
                     shape="round"
                     type="primary"
                     onClick={handleOpenReservationRoom}
                  >
                     Забронировать
                  </Button>
            </div>
         </Card>
         {/* <img className="w-[100%] h-[350px] rounded-b-lg translate-y-[-5px] shadow-md hover:shadow-xl transition-shadow duration-300 bg-white" src={imageURL}/> */}
      </div>
   );

   function handleOpenReservationRoom() {
      nav(`${id}`);
   }
}

MeetingRoomsItem.displayName = 'MeetingRoomsItem';

export function MeetingRoomsList() {
  const rooms = useMeetingRooms();

  const meetingRooms = useMemo(() => {
    return rooms.map((room) => <MeetingRoomsItem key={room.id} {...room} />);
  }, [rooms]);

  return (
    <div className="h-auto w-full overflow-auto" style={listStyles}>
      <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {meetingRooms}
        {/* {[1, 2, 3].map((e) => {return <MeetingRoomsItem key={e}/>})} */}
      </div>
    </div>
  );
}

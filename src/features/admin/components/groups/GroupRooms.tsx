import { List, Button } from 'antd';
import { useGroupRooms } from '../../hooks/useGroupRooms';
import { GroupRoomsList } from './GroupRoomsList';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { useNavigate } from 'react-router';

type GroupId = {
   groupId: number;
};

export function GroupRooms({ groupId }: GroupId) {
   const nav = useNavigate();
   const rooms = useGroupRooms(groupId);

   return(
      <div className="w-full h-full overflow-auto" style={{ padding: 10, paddingTop: 0 }}>
         <List
            className="bg-white rounded-md"
            style={{ padding: 10, paddingBottom: 15 }}
            dataSource={rooms}
            renderItem={(e) => <GroupRoomsList {...e}/>}
         />
         <Button
           shape="round"
           icon={<IoIosAddCircleOutline />}
           className="w-50"
           size="middle"
           type="primary"
           onClick={() => nav(`edit/${groupId}`)}
         >
            Изменить группу
         </Button>
      </div>
   );
}
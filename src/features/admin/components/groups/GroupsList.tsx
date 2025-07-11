import { useGroups } from '../../hooks/useGroups';
import { Button, List, Typography } from 'antd';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { GroupListItem } from './GroupsListItem';
import { useEffect, useState } from 'react';

export function GroupsList() {
   const nav = useNavigate();
   const groups = useGroups();
   const [Id, setId] = useState(0);
   const [counter, setCounter] = useState(1);
   
   let location = useLocation();

   function handelChange(id: number) {
      setId(id);
      if (id==Id) {
         setCounter(counter+1);
      } else {
         setCounter(1);
      }
   }

   useEffect(() => {
      setCounter(1);
      setId(0);
   }, [location.pathname]);

   return (
      <div className="flex flex-col h-auto w-full overflow-auto">
         <Button
         shape="round"
         icon={<IoIosAddCircleOutline />}
         className="w-50"
         size="middle"
         type="primary"
         onClick={() => nav('new')}
         >
         Создать группу
         </Button>
         <Typography.Title level={5}>Группы:</Typography.Title>
         <div className="w-full h-full overflow-auto">
         <List
            className="bg-white rounded-md"
            style={{ padding: 10 }}
            dataSource={groups}
            renderItem={(group) => <GroupListItem
               id={group.id}
               name={group.name}
               IsView={(group.id==Id)? (counter%2==0)? false: true: false}
               handelChangeIsView={() => handelChange(group.id)}
            />}
         />
         </div>
         <Outlet />
      </div>
   );
}
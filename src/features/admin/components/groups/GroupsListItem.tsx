import { useApi } from '@/app/shared/api/useApi';
import { GROUPS_API } from '@/app/shared/constants';
import { userConfirmAction } from '@/app/shared/utils';
import { Group } from '../../types';
import { Button, List } from 'antd';
import { useEffect, useState } from 'react';
import { MdKeyboardArrowDown, MdDelete } from 'react-icons/md';
import { GroupRooms } from './GroupRooms';
import { mutate } from 'swr';
import { useLocation } from 'react-router';

export function GroupListItem({ id, name}: Group) {
   const api = useApi();
   const [ isView, setIsView ] = useState(false);
   let location = useLocation();

   useEffect(() => {
      setIsView(false);
   }, [location.pathname]);

   return (
      <List.Item
         style={{ padding: 0 }}
         className="flex flex-row justify-start items-center"
      >
         <div className='w-[100%] flex flex-col'>
            <div
               style={{ padding: 10 }}
               className='w-[100%] flex flex-row justify-between hover:border-none hover:bg-gray-100 duration-200'
               onClick={() => {setIsView(!isView);}}
            >
               <div className="grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <span>{name}</span>
                  {/* <span className="truncate">{adGroupDN}</span> */}
               </div>
               <div className="flex flex-row gap-5">
                  <Button
                     onClick={() => {setIsView(!isView);}}
                     icon={<MdKeyboardArrowDown />}
                     shape="circle"
                     title="Показать группу"
                  />
                  <Button
                     icon={<MdDelete />}
                     onClick={handleDeleteGroup}
                     shape="circle"
                     title="Удалить группу"
                  />
               </div>
            </div>
            {isView ? <GroupRooms groupId={id}/>: null}
         </div>
      </List.Item>
   );

   async function handleDeleteGroup() {
      try {
         if (!id) return;

         const confirm = userConfirmAction(`Удалить рабочее место ${name}`);

         if (!confirm) return;

         const response = await api.delete<Group>(
         `${GROUPS_API}/${id}`,
         );
         mutateSwrGroupsCache(response.data);
      } catch (e) {
         console.log(e);
      }
   }
}

async function mutateSwrGroupsCache(group?: Group) {
   if (!group) return;
   await mutate(
      GROUPS_API,
      (data?: Group[]) => {
         if (!data) return data;

         return data.filter((item) => item.id !== group.id);
      },
      {
         revalidate: false,
      },
   );
}

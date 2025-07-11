import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useApi } from '@/app/shared/api/useApi';
import { GROUPS_API } from '@/app/shared/constants';
import { useNotifications } from '@/app/shared/hooks/useNotifications';
import { Button, Drawer, Form, Input, List, Typography } from 'antd';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import useSWR, { mutate } from 'swr';
import { isFormValid } from '../../utils';
import { Group, GroupRooms, permissionsType } from '../../types';
import { useGroup } from '../../hooks/useGroup';
import { RoomsListForForm } from './RoomsListForForm';
// import { useFreedomGroupRooms } from '../../hooks/useFreedomGroupRooms'; //Использовать если нужны уникальные комнаты
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline } from 'react-icons/io';
import { useMeetingRooms } from '@/features/meeting_rooms/hooks/useMeetingRooms';

type AddRoomFormData = Omit<GroupRooms, 'id'>;
type AddGroupFormData = Omit<Group, 'id'>;
type AddFreedomRooms = {
   permissions: permissionsType[];
}

const defaultAddRoomFormData: AddRoomFormData = {
   name: '',
   adGroupDN: '',
   permissions: [
      {
         max_future_reservation: '0d',
         meetingroom_id: 0,
      },
   ],
};

const defaultAddGroupFormData: AddGroupFormData = {
   name: '',
   adGroupDN: '',
}

const defaultFreedomRooms: AddFreedomRooms = {
   permissions: [
      {
         max_future_reservation: '0d',
         meetingroom_id: 0,
      },
   ]
}

export function AddGroupForm() {
   const { groupId } = useParams();//id текущей
   const nav = useNavigate();
   const { send, ctx } = useNotifications();
   const { post, patch } = useApi();
   let rooms;
   let freedomRoomsId: number[] = [];
   let dat = undefined;
   
   if (groupId) {
      const { data } = useSWR<GroupRooms>(`${GROUPS_API}/${groupId}`);
      dat = data;
      
      rooms = useMeetingRooms(); //Использовать useFreedomGroupRooms если нужны уникальные комнаты
      const roomsId = rooms.map(e => e.id);
      if (data) {
         roomsId.forEach(el => {
            let a: boolean = true;
            data.permissions.forEach(item => {
               if (item.meetingroom_id == el) {
                  a = false
                  return;
               }
            });
            if (a) {
               freedomRoomsId.push(el);
            }
         });
      }
   }

   let initFreedomRooms: AddFreedomRooms = defaultFreedomRooms;
   let arrayFreedom: permissionsType[] = [];
   if (freedomRoomsId) {
      freedomRoomsId.forEach(e => {
         let initData: permissionsType = {
            max_future_reservation: '0d',
            meetingroom_id: e,
         };
         arrayFreedom.push(initData);
      });
   }
   initFreedomRooms.permissions=arrayFreedom;

   const initFormData = useGroup(groupId);//группа по id
   const initFormDataPatch = dat ?? defaultAddRoomFormData;//группа по id

   const [freedomRooms, setFreedomRooms] = useState<AddFreedomRooms>(
      defaultFreedomRooms,
   );

   const [formData, setFormData] = useState<AddGroupFormData>(
      defaultAddGroupFormData,
   );

   const [formDataPatch, setFormDataPatch] = useState<AddRoomFormData>(
      defaultAddRoomFormData,
   );

   useEffect(() => {
      if (initFormData) setFormData({ ...initFormData });
   }, [initFormData]);
   
   useEffect(() => {
      if (initFormDataPatch) {
         let initData: AddRoomFormData = defaultAddRoomFormData;
         initData.name = initFormDataPatch.name;
         initData.adGroupDN = initFormDataPatch.adGroupDN;
         initData.permissions = initFormDataPatch.permissions;
         setFormDataPatch({ ...initData });
      };
   }, [initFormDataPatch]);

   useEffect(() => {
      if (initFreedomRooms) {
         setFreedomRooms({ ...initFreedomRooms })
      }
   }, [initFreedomRooms]);

   const set = (attrs: Partial<AddGroupFormData>) => {
      setFormData({ ...formData, ...attrs });
   };

   const setP = (attrs: Partial<AddRoomFormData>) => {
      setFormDataPatch({ ...formDataPatch, ...attrs });
   };

   const isEditMode = !!groupId;
   const title = isEditMode
      ? 'Редактировать группу'
      : 'Создать новую группу';

   return (
      <Drawer title={title} size="large" onClose={() => nav('/admin/groups')} open>
         <Form labelWrap onSubmitCapture={handleCreateRoom} labelCol={{ span: 3 }}>
         <Form.Item label="Название">
            <Input
               onChange={!isEditMode? handleInputChange('name'): handleInputChangePatch('name')}
               value={!isEditMode? formData.name: formDataPatch.name}
               type="text"
            />
         </Form.Item>
         <Form.Item label="Описание">
            <Input
               onChange={!isEditMode? handleInputChange('adGroupDN'): handleInputChangePatch('adGroupDN')}
               value={!isEditMode? formData.adGroupDN: formDataPatch.adGroupDN}
               type="text"
            />
         </Form.Item>
         {isEditMode ?
            <Form.Item label="Комнаты">
               <div className='ant-col'>
                  <div style={{ padding: 5 }}>
                     <Typography.Text >В группе:</Typography.Text>
                     <List
                        className="bg-white rounded-md"
                        style={{ paddingTop: 5 }}
                        dataSource={formDataPatch.permissions}
                        renderItem={(e) => <RoomsListForForm
                           roomId={e.meetingroom_id}
                           inGroup={true}
                           icon={<IoIosRemoveCircleOutline />}
                           inputValue={parseInt(e.max_future_reservation.split(' ')[0])} // надо будет добавить доп inputs для формата 00:00:00
                           change={hendelRemoveRoom(e)}
                           reservChange={handlePermissionChange}
                        />}
                     />
                  </div>
                  <div style={{ paddingTop: 5 }}>
                     <Typography.Text style={{ marginTop: 10 }}>Без группы:</Typography.Text>
                     <List
                        className="bg-white rounded-md"
                        style={{ paddingTop: 5}}
                        dataSource={freedomRooms.permissions}
                        renderItem={(e) => <RoomsListForForm
                           roomId={e.meetingroom_id}
                           inGroup={false}
                           icon={<IoIosAddCircleOutline />}
                           inputValue={parseInt(e.max_future_reservation.split(' ')[0])}
                           change={hendelAddRoom(e)}
                           reservChange={handlePermissionChange}
                        />}
                     />
                  </div>
               </div>
            </Form.Item>
         : null}
         <Button
            disabled={!isEditMode ? !(isFormValid(formData)) : false}
            shape="round"
            htmlType="submit"
            type="primary"
         >
            {isEditMode ? 'Сохранить' : 'Создать'}
         </Button>
         </Form>
         {ctx}
      </Drawer>
   );

   async function handleCreateRoom() {
      try {
         const res = !isEditMode && isFormValid(formData)?
            await post<Group>(`${GROUPS_API}/`, formData)
         :
            await patch<GroupRooms>(`${GROUPS_API}/${groupId}`, formDataPatch);

         const groupData = res.data;

         mutateSwrRoomsCache(groupData, !isEditMode && isFormValid(formData));
         nav('/admin/groups');
      } catch (e) {
         const err = e as AxiosError;

         if (err.status === 422) {
            const errHasData = err as AxiosError & {
               data: ResponseApiUnprocessableEntity;
            };
            const errorMessages = errHasData.data.detail.flatMap(({ msg }) =>
               msg ? [msg] : [],
            );

            send('error', errorMessages);
         } else {
            send('error', ['An unexpected error occurred']);
            console.error('Reservation error:', err);
         }
      }
   }

   function handleInputChange(key: keyof typeof formData) {
      return function (e: React.ChangeEvent<HTMLInputElement>) {
         set({ [key]: e.target.value });
      };
   }

   function handleInputChangePatch(key: keyof typeof formDataPatch) {
      return function (e: React.ChangeEvent<HTMLInputElement>) {
         setP({ [key]: e.target.value });
      };
   }

   function hendelChengeRooms(key: keyof typeof formDataPatch, e: permissionsType[], free: permissionsType[]) {
      return function () {
         let attr: AddFreedomRooms = {
            permissions: free,
         };
         setP({ [key]: e });
         setFreedomRooms({ ...attr });
      };
   }

   function hendelAddRoom(room: permissionsType) {
      return hendelChengeRooms('permissions', [...formDataPatch.permissions, room], freedomRooms.permissions.filter(item => room!=item));
   }

   function hendelRemoveRoom(room: permissionsType) {
      return hendelChengeRooms('permissions', formDataPatch.permissions.filter(item => room!=item), [...freedomRooms.permissions, room]);
   }

   function handlePermissionChange(e: React.ChangeEvent<HTMLInputElement>) {
      const permis = formDataPatch.permissions.map(item => {
         if (parseInt(e.target.id) == item.meetingroom_id) {
            let newRoom: permissionsType = {
               max_future_reservation: e.target.value+'d',
               meetingroom_id: parseInt(e.target.id),
            };
            return newRoom;
         } else {
            return item;
         }
      });
      setP({ 'permissions': permis });
   }
}

async function mutateSwrRoomsCache(group?: Group, create: boolean = true) {
   if (!group) return;
   
   await mutate(
      GROUPS_API,
      (data?: Group[]) => {
         if (!data) return data;
         if (create) return [...data, group];
         return data.map((item) => (item.id === group.id ? {name:group.name, adGroupDN: group.adGroupDN, id: group.id} : item));
      },
      {
         revalidate: false,
      },
   );
}

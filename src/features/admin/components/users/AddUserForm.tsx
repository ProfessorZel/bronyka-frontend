import { ResponseApiUnprocessableEntity } from '@/app/shared/api/types';
import { useApi } from '@/app/shared/api/useApi';
import { AUTH_API, USERS_API } from '@/app/shared/constants';
import { useNotifications } from '@/app/shared/hooks/useNotifications';
import {
  Button,
  Checkbox,
  CheckboxChangeEvent,
  Drawer,
  Form,
  Input,
  Select,
} from 'antd';
import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { mutate } from 'swr';
import { useUser } from '../../hooks/useUser';
import { User } from '../../types';
import { isFormValid } from '../../utils';
import { useGroups } from '../../hooks/useGroups';

type AddUserFormDataRaw = Omit<User, 'id'>;
type AddUserFormDataRawW = Omit<AddUserFormDataRaw, 'group'>;

type AddUserFormData = AddUserFormDataRawW & { group_id: number }

const defaultAddUserFormData: AddUserFormData = {
   fio: '',
   is_active: true,
   is_superuser: false,
   is_verified: true,
   birthdate: new Date().toISOString().split('T')[0],
   email: '',
   password: '',
   group_id: 0,
};

export function AddUserForm() {
   const { userId } = useParams();
   const { post, patch } = useApi();
   const nav = useNavigate();
   const { send, ctx } = useNotifications();

   const initFormDatRaw = useUser(userId ? parseInt(userId) : undefined);
   const groups = useGroups();
   let initFormDataRaw: AddUserFormData = JSON.parse(JSON.stringify(defaultAddUserFormData));
   if (initFormDatRaw) {
      let haveGroup = false;
      let groupHaves = 0;

      initFormDataRaw.birthdate = initFormDatRaw.birthdate;
      initFormDataRaw.email = initFormDatRaw.email;
      initFormDataRaw.fio = initFormDatRaw.fio;
      initFormDataRaw.is_active = initFormDatRaw.is_active;
      initFormDataRaw.is_superuser = initFormDatRaw.is_superuser;
      initFormDataRaw.is_verified = initFormDatRaw.is_verified;
      initFormDataRaw.password = initFormDatRaw.password;

      if (initFormDatRaw.group) {
         groups.forEach((e) => {
            if (e.name == initFormDatRaw.group.name) {
               haveGroup = true;
               groupHaves = e.id;
            }
         });
      }

      if (haveGroup) {
         initFormDataRaw.group_id = groupHaves;
      } else {
         initFormDataRaw.group_id = 0;
      }
   }
   
   const initFormData = useMemo(() => initFormDataRaw, [initFormDataRaw.fio]);

   const [formData, setFormData] = useState<AddUserFormData>(
      defaultAddUserFormData,
   );

   useEffect(() => {
      if (initFormData) setFormData({ ...initFormData });
   }, [initFormData]);

   const set = (attrs: Partial<AddUserFormData>) => {
      setFormData({ ...formData, ...attrs });
   };

   const isEditMode = !!userId;
   const title = isEditMode
      ? 'Редактировать пользователя'
      : 'Создать пользователя';

   return (
      <Drawer title={title} size="large" onClose={() => nav('/admin/users')} open>
         <Form labelWrap onSubmitCapture={handleCreateUser} labelCol={{ span: 3 }}>
         <Form.Item label="ФИО">
            <Input
               onChange={handleInputChange('fio')}
               value={formData.fio}
               type="text"
            />
         </Form.Item>
         <Form.Item label="Email">
            <Input
               onChange={handleInputChange('email')}
               value={formData.email}
               title="email"
            />
         </Form.Item>
         <Form.Item label="Пароль">
            <Input
               onChange={handleInputChange('password')}
               value={formData.password}
               type="text"
            />
         </Form.Item>
         <Form.Item label="Админ">
            <Checkbox
               onChange={handleCheckboxChange}
               value={formData.is_superuser}
            />
         </Form.Item>
         <Form.Item label="Группа">
            <Select
               defaultValue={formData.group_id}
               onChange={value => {formData.group_id = value}}
            >
               <Select.Option value={0}>Без Группы</Select.Option>
               {groups.map(group => <Select.Option key={group.id} value={group.id}>{group.name}</Select.Option>)}
            </Select>
         </Form.Item>
         <Button
            disabled={!isEditMode ? !isFormValid(formData) : false}
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

   function handleInputChange(key: keyof typeof formData) {
      return function (e: React.ChangeEvent<HTMLInputElement>) {
         set({ [key]: e.target.value });
      };
   }

   function handleCheckboxChange(e: CheckboxChangeEvent) {
      set({ is_superuser: e.target.checked });
   }

   async function create() {
      const created = await post<User>(`${AUTH_API}/register`, formData);

      if (created.status === 201 && formData.is_superuser) {
         const userId = created.data.id;
         userId && (await patch<User>(`${USERS_API}/${userId}`, formData));
      }
   }

   async function handleCreateUser() {
      try {
         !isEditMode && isFormValid(formData)
         ? await create()
         : await patch<User>(`${USERS_API}/${userId}`, formData);

         await mutate(() => true, undefined, {
         revalidate: true,
         });

         nav('/admin/users');
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
         send('error', ['Произошла непредвиденная ошибка']);
         }
      }
   }
}

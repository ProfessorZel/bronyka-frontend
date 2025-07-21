import { userConfirmAction } from "@/app/shared/utils";
import { Button, List } from "antd";
import { MdDelete } from "react-icons/md";
import { mutate } from "swr";
import { WorkSheets } from "../../types";
import { useApi } from "@/app/shared/api/useApi";
import { GOOGLE_SHEETS_API } from "@/app/shared/constants";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import { AxiosError } from "axios";
import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";

export function WorkSheetItem({ id, spreadsheet_url, worksheet }: WorkSheets) {
    const api = useApi();
    const { send, ctx } = useNotifications();

    return(
        <>
            <List.Item>
                <span>{spreadsheet_url}</span>
                <span>{worksheet}</span>
                <Button 
                    onClick={handleDeleteRoom}
                    icon={<MdDelete />}
                    shape="circle"
                    title="Удалить"
                />
            </List.Item>
            {ctx}
        </>
    );

    async function handleDeleteRoom() {
        try {
            if (!id) return;
        
            const confirm = userConfirmAction(`Удалить рабочее место ${name}`);
        
            if (!confirm) return;
        
            const response = await api.delete<WorkSheets>(
                `${GOOGLE_SHEETS_API}/${id}`,
            );

            if (response.status === 200) {
                send('success', [`Пара таблицы и книги-'${response.data.worksheet}' успешно удалена.`]);
            }

            mutateSwrSheetsCache(response.data);
        } catch (error) {
            const err = error as AxiosError;
            if (err.status === 422 || err.status === 400) {
                const errHasData = err as AxiosError & {
                    data: ResponseApiUnprocessableEntity;
                };
                if (Array.isArray(errHasData.data.detail)) {
                    const errorMessages = errHasData.data.detail
                    .flatMap(({ msg }) => (msg ? [msg] : []))
                    .filter(Boolean);
                    send('error', errorMessages);
                    console.log(errorMessages);
                }

                if (typeof errHasData.data.detail === 'string') {
                    send('error', errHasData.data.detail);
                    console.log(errHasData.data.detail);
                }
          
            } else {
                send('error', ['Произошла непредвиденная ошибка']);
                console.error(err);
            }
        }
    }
}

async function mutateSwrSheetsCache(sheet?: WorkSheets) {
  if (!sheet) return;

  await mutate(
    GOOGLE_SHEETS_API,
    (data?: WorkSheets[]) => {
      if (!data) return data;

      return data.filter((item) => item.id !== sheet.id);
    },
    {
      revalidate: false,
    },
  );
}
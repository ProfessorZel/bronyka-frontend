import { Typography, Form, Input, Button } from "antd";
import { useState } from "react";
import { isFormValid } from "../../utils";
import { useApi } from "@/app/shared/api/useApi";
import { /*Sheets,*/ SpreadSheetsValidate } from "../../types";
import { GOOGLE_SHEETS_VALIDATE_API } from "@/app/shared/constants";
import { AxiosError } from "axios";
import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import { SheetSelector } from "./SheetsSelector";
import { CircleLoading } from "@/app/shared/animatedcomponents/CircleLoading";

type detale = {
    loc?: string[] | undefined;
    msg?: string | undefined;
    type?: string | undefined;
}[]

function keys<T extends object>(obj: T) {
    return Object.keys(obj) as Array<keyof T>;
}

function isObject(obj: any) {
    return obj === Object(obj);
}

type dataUrl = {
    spreadsheet_url: string;
}

const defaultFormData: dataUrl = {
    spreadsheet_url: ''
}

const testTab: SpreadSheetsValidate = {
    title: '',
    spreadsheet_url: '',
    worksheets: [''],
}

export function ValidateSheetForm() {
    const { post } = useApi();
    const { send, ctx } = useNotifications();
    const [ formData, setFormData ] = useState<dataUrl>(
        defaultFormData
    );
    const [ loading, setLoading ] = useState(false);
    const [ disabledUrlChange, setDisabledUrlChange ] = useState(false);
    const [ spreadSheets, setSpreadSheets ] = useState<SpreadSheetsValidate>(testTab);

    return(
        <div className="w-full flex flex-col justify-between items-start gap-2">
            <Form labelWrap onSubmitCapture={handelSubmit} labelCol={{ span: 3 }} className="w-full">
                <Typography.Title level={5} style={{ padding: 0 }}>Ссылка на таблицу:</Typography.Title>
                <Form.Item style={{ margin: 0 }}>
                    <div style={{ paddingBottom: 10 }}>
                        <Input
                            value={formData.spreadsheet_url}
                            onChange={handelChange()}
                            type="text"
                            placeholder="Введите URL таблицы"
                            disabled={disabledUrlChange}
                        />
                    </div>
                </Form.Item>
                {!disabledUrlChange?
                    <Button
                        className="w-full"
                        disabled={!isFormValid(formData)}
                        shape="round"
                        htmlType="submit"
                        type="primary"
                    >Применить</Button>
                : null}
            </Form>
            {loading? <div className="w-full h-full flex justify-center items-center" style={{ padding: 30 }}>
                <CircleLoading />
            </div>: disabledUrlChange? <SheetSelector {...spreadSheets}/>: null}
            {ctx}
        </div>
    );

    function handelChange() {
        return function (e: React.ChangeEvent<HTMLInputElement>) {
            setFormData({ spreadsheet_url: e.target.value});
        }
    }

    async function handelSubmit() {
        setLoading(true);
        setDisabledUrlChange(true);

        try {
            const res = await post<SpreadSheetsValidate>(GOOGLE_SHEETS_VALIDATE_API, formData);
            setSpreadSheets(res.data);

            send('success', [`Доступ к талице "${res.data.title}" успешно получен`])
        } catch(error) {
            setDisabledUrlChange(false)
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
                }
                
                if (isObject(errHasData.data.detail)) {
                    let errorMessage = '';
                    const detail = errHasData.data.detail;
                    const errorKey = keys<detale>(detail)[0];
                    const massegeKey = keys<detale>(detail)[1];

                    for (const key of keys<detale>(detail)) {
                        if (key === errorKey || key === massegeKey) {
                            errorMessage += `${errHasData.data.detail[key]} `;
                        }
                    }

                    send('error', [errorMessage]);
                }
                
                if (typeof errHasData.data.detail === 'string') {
                    send('error', errHasData.data.detail);
                }

            } else {
                send('error', ['Произошла непредвиденная ошибка']);
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    }
}
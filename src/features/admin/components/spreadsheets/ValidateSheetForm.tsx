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
import { motion, useTime, useTransform } from "motion/react";
import { LuLoaderCircle } from "react-icons/lu";

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

// const sheets = ["Т-2025", "И-2025", "ГПР-2025", "НН", "И-2024", "Т-2024"]

const testTab: SpreadSheetsValidate = {
    title: '',//Табель учета рабочего времени
    spreadsheet_url: '',//https://docs.google.com/spreadsheets/d/12QFIRngaCI-m46ff20WTW0RZk3g3dcWkUNl-1j9eTyQ
    worksheets: [''],//sheets
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

    const time = useTime();
    const rotate = useTransform(time, [0, 500], [0, 360], { clamp: false });

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
                        disabled={!isFormValid(formData)}
                        shape="round"
                        htmlType="submit"
                        type="primary"
                    >Применить</Button>
                : null}
            </Form>
            {loading?
                <div className="w-full h-full flex justify-center items-center" style={{ padding: 30 }}>
                    <motion.div
                        className="w-[50px] h-[50px]"
                        style={{ rotate, color: '#1677ff' }}
                    ><LuLoaderCircle className="w-[100%] h-[100%]"/></motion.div>
                </div>
            : disabledUrlChange? <SheetSelector {...spreadSheets}/>: null}
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
            console.log(res.data);
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
                    console.log(errorMessages);
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
                    console.log(errHasData.data.detail);
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
import { Button, Card, List, Radio, Typography } from "antd";
import { SpreadSheetsValidate } from "../../types";
import { useState } from "react";
import { useApi } from "@/app/shared/api/useApi";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import { AxiosError } from "axios";
import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";
import { motion, useTime, useTransform } from "motion/react";
import { LuLoaderCircle } from "react-icons/lu";
import { FcOk } from "react-icons/fc";

interface SheetData {
    spreadsheet_url: string;
    worksheet: string;
}

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

export function SheetSelector({ spreadsheet_url, title, worksheets}: SpreadSheetsValidate) {
    const api = useApi();
    const { send, ctx } = useNotifications();
    const defaultSheetData = {
        spreadsheet_url: spreadsheet_url,
        worksheet: ''
    }
    const [ sheetData, setSheetData ] = useState<SheetData>(defaultSheetData);
    const [ disabled, setDisabled ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);

    const time = useTime();
    const rotate = useTransform(time, [0, 500], [0, 360], { clamp: false });

    return(
        <div className="w-full flex flex-col">
            {!disabled? 
                <Card className="w-full flex flex-col">
                    <div className="w-full flex flex-col">
                        <Typography.Title level={5} style={{ padding: 0 }}>{title}</Typography.Title>
                        <span>Добавить лист в работу</span>
                        <Radio.Group value={sheetData.worksheet}>
                            <List
                                className="flex flex-col w-full"
                                style={{ paddingTop: 10 }}
                                dataSource={worksheets}
                                renderItem={(sheet, num=0) => {
                                    return(<List.Item >
                                        <div className="w-full">
                                            <Radio
                                                className="w-full"
                                                value={sheet}
                                                onClick={() => {setSheetData({spreadsheet_url: spreadsheet_url, worksheet: sheet})}}
                                            >
                                                <span>Лист_{num+1}: {sheet}</span>
                                            </Radio>
                                        </div>
                                    </List.Item>);
                                }}
                            />
                        </Radio.Group>
                    </div>
                    <Button
                        onClick={handelAddSheet}
                        shape="round"
                        type="primary"
                    >Добавить</Button>
                </Card>
            : isLoading? 
                <div className="w-full h-full flex justify-center items-center" style={{ padding: 30 }}>
                    <motion.div
                        className="w-[50px] h-[50px]"
                        style={{ rotate, color: '#1677ff' }}
                    ><LuLoaderCircle className="w-[100%] h-[100%]"/></motion.div>
                </div>
            : <div className="w-full h-full flex justify-center items-center" style={{ padding: 30 }}>
                <div className="flex flex-row justify-center items-center gap-2">
                    <FcOk size={50}/>
                    <span>Успех</span>
                </div>
            </div>}
            {ctx}
        </div>
    );

    async function handelAddSheet() {
        setDisabled(true);
        setIsLoading(true)
        try {
            const response = await api.post('api/googlesheets', sheetData);
            if (response.status === 200) {
                send('success', ['Лист таблицы готов к работе']);
            }
        } catch(error) {
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
                    const detail = errHasData.data.detail;
                    const massegeKey = keys<detale>(detail)[0];
                    const errorConsole = keys<detale>(detail)[1];

                    console.error(detail[errorConsole]);

                    const errorMessage = detail[massegeKey];

                    send('error', [`${errorMessage}`]);
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
            setIsLoading(false)
        }
    }
}
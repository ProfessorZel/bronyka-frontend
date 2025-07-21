import { Button, Card, List, Radio, Typography } from "antd";
import { SpreadSheetsValidate } from "../../types";
import { useEffect, useState } from "react";
import { useApi } from "@/app/shared/api/useApi";
import { useNotifications } from "@/app/shared/hooks/useNotifications";
import { AxiosError } from "axios";
import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";
import { hover, motion } from "motion/react";
import { GOOGLE_SHEETS_API } from "@/app/shared/constants";
import { animate } from "motion";
import { mutate } from "swr";
import { CircleLoading } from "@/app/shared/animatedcomponents/CircleLoading";

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
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isList, setIsList ] = useState(false);

    useEffect(()=>{
        hover(".li", (element) => {
            animate(element, { background: '#84bbff', color: '#ffffff' })
    
            return () => animate(element, { background: '#ffffff', color: '#000000' })
        })
    }, [document.querySelector('.box'), document.querySelector('.li')]);

    return(
        <div className="w-full flex flex-col">
            <Typography.Title level={5} style={{ padding: 0 }}>Таблица '{title}'</Typography.Title>
            {!isLoading?
                <div>
                    <Card className="w-full flex flex-col">
                        <div className="w-full flex flex-col">
                            <Button
                                onClick={() => {setIsList(!isList)}}
                                type="primary"
                                size="large"                 
                            >
                                Добавить книгу в работу
                            </Button>
                        </div>
                        {isList && <div className="flex flex-col">
                            <Radio.Group value={sheetData.worksheet}>
                                <List
                                    className="flex flex-col w-full"
                                    style={{ paddingTop: 10, paddingBottom: 10 }}
                                    dataSource={worksheets}
                                    renderItem={(sheet) => {
                                        return(
                                            <motion.div 
                                                className="li"
                                                style={{ paddingLeft: 10, borderRadius: 5 }}
                                                initial={{ scale: 1, filter: "drop-shadow(0 0 #4d97ffff)", background: '#ffffff' }}
                                                whileTap={{ scale: 0.999, filter: "drop-shadow(0px 0px 4px #4d97ffff)" }}
                                            >
                                                <Radio
                                                    className="w-full h-full"
                                                    style={{ paddingTop: 10, paddingBottom: 10 }}
                                                    value={sheet}
                                                    onClick={() => {setSheetData({spreadsheet_url: spreadsheet_url, worksheet: sheet})}}
                                                >
                                                    <div className="w-full">
                                                        <span>{sheet}</span>
                                                    </div>
                                                </Radio>
                                            </motion.div>
                                        );
                                    }}
                                />
                            </Radio.Group>
                            <Button
                                onClick={handelAddSheet}
                                shape="round"
                                type="primary"
                            >Добавить</Button>
                        </div>}
                    </Card>
                </div>
            : isLoading? 
                <div className="w-full h-full flex justify-center items-center" style={{ padding: 30 }}>
                    <CircleLoading />
                </div>
            : null}
            {ctx}
        </div>
    );

    async function handelAddSheet() {
        // setDisabled(true);
        setIsLoading(true)
        try {
            const response = await api.post(GOOGLE_SHEETS_API, sheetData);
            if (response.status === 200) {
                send('success', ['Книга таблицы готов к работе']);
            }
            await mutate(() => true, undefined, { revalidate: true });
        } catch(error) {
            const err = error as AxiosError;
            // setDisabled(false);
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
            setIsLoading(false);
            setIsList(false);
        }
    }
}
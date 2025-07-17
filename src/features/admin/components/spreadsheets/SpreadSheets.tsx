import { Outlet } from "react-router";
import { useEffect, useState } from "react";
import { SheetsInstruction } from "../../types";
import { GOOGLE_SHEETS_META_API } from "@/app/shared/constants";
import { useApi } from "@/app/shared/api/useApi";
import { AxiosError } from "axios";
import { ResponseApiUnprocessableEntity } from "@/app/shared/api/types";
import { CiCircleAlert } from "react-icons/ci";

type PromiseReturn = {
    instructMassege: string | undefined, 
    instructStatus: boolean
};

export function SpreadSheets() {
    const { get } = useApi();
    const [ instructions, setInstructions ] = useState<string | undefined>(
        undefined
    );
    const [ isValid, setIsValid ] = useState(true);
    const [ serviceAccountEmail , setEmail ] = useState<string>('berffbd@email.com');

    async function SpreadSheetsInstuctions(): Promise<PromiseReturn | undefined> {
        try {
            const response = await get<SheetsInstruction>(GOOGLE_SHEETS_META_API);
            if (response) {
                setEmail(response.service_account_email);
                return {instructMassege: response.instructions, instructStatus: true};
            }            
        } catch(error) {
            const err = error as AxiosError;
            if (err.status === 500) {
                const errHasData = err as AxiosError & {
                data: ResponseApiUnprocessableEntity;
                };
                if (Array.isArray(errHasData.data.detail)) {
                    const massege = errHasData.data.detail
                        .flatMap(({msg}) => (msg ? [msg]: []))
                    return {instructMassege: massege.pop(), instructStatus: false};
                }
                if (typeof errHasData.data.detail === 'string') {
                    return {instructMassege: errHasData.data.detail, instructStatus: false};
                }
            }
        }
    }


    useEffect(() => {
        (async () => {
            const instruct = await SpreadSheetsInstuctions();
            if (instruct) {
                setIsValid(instruct.instructStatus);
                setInstructions(instruct.instructMassege);
            }
        })()
    }, []);

    return(
        <div className="flex flex-col h-auto w-full overflow-auto">
            {isValid?
                <div className="w-full h-full bg-white rounded-lg flex flex-col" style={{ padding: 10 }}>
                    <span>{serviceAccountEmail}</span>
                    <span>{instructions}</span>
                </div>
            :<div className="w-full h-full bg-white rounded-lg flex flex-col items-center" style={{ padding: 10 }}>
                <span>{instructions}</span>
                <div className="w-full h-[1px]" style={{ marginTop: 10, backgroundColor: '#e0e0e0ff' }}/>
                <div className="flex flex-col items-center" style={{ padding: 50 }}>
                    <CiCircleAlert color="#ff0000c1" size={100} title="Ошибка с кодом 500"/>
                    <span>Ошибка сервера</span>
                </div>
            </div>
            }
            <Outlet />
        </div>
    );
}
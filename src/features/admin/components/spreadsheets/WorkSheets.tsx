import { Card, List, Typography } from "antd";
import { WorkSheetItem } from "./WorkSheetItem";
// import { WorkSheets } from "../../types";

type sheets = {
    id: number;
    spreadsheet_url: string;
    worksheet: string;
    service_account_email: string;
}

interface WorkSheet {
    worksheetArr: sheets[];
}


export function WorkSheets({ worksheetArr }: WorkSheet) {
    

    return(
        <Card className="w-full flex flex-col" style={{ marginTop: 10 }}>
            <div className="w-full flex flex-col">
                <Typography.Text style={{ padding: 0 }}>Книги в работе:</Typography.Text>
                <List
                    dataSource={worksheetArr}
                    renderItem={e => <WorkSheetItem {...e}/>}
                />
            </div>
        </Card>
    );
}
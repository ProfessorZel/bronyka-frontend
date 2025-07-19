import { Card, List, Typography } from "antd";
import { useWorkSheets } from '../../hooks/useWorkSheets'

export function WorkSheets() {
    const worksheets = useWorkSheets();

    return(
        <Card className="w-full flex flex-col" style={{ marginTop: 10 }}>
            <div className="w-full flex flex-col">
                <Typography.Text style={{ padding: 0 }}>Книги в работе:</Typography.Text>
                <List
                    dataSource={worksheets}
                    renderItem={e => 
                        <List.Item>{e.worksheet}</List.Item>
                    }
                />
            </div>
        </Card>
    );
}
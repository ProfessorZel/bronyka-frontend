export interface ICustomTooolbarProps {
    view: string;
    label: any;
    localizer: any;
    onNavigate: (action: any) => void;
    onView: (view: any) => void;
    onViewChange: (view: any) => void;
    messages: any;
}

export const navigateContants = {
    PREVIOUS: 'PREV',
    NEXT: 'NEXT',
    TODAY: 'TODAY',
    DATE: 'DATE'
};

export default function CustomToolbar(props: ICustomTooolbarProps) {
    function navigate(action: any) {
        props.onNavigate(action);
    }

    return (
        <div className="rbc-toolbar">
            <span className="rbc-btn-group">
                <button type="button" onClick={navigate.bind(null, navigateContants.TODAY)}>
                    Current month
                </button>
                <button type="button" onClick={navigate.bind(null, navigateContants.PREVIOUS)}>
                    Previous month
                </button>
                <button type="button" onClick={navigate.bind(null, navigateContants.NEXT)}>
                    Next month
                </button>
            </span>

            <span className="rbc-toolbar-label">{props.label}</span>
        </div>
    );
};
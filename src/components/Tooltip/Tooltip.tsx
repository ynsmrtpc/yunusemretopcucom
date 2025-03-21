import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipComponentProps {
    children: React.ReactNode;
    tooltip: string;
}

const TooltipComponent: React.FC<TooltipComponentProps> = ({ children, tooltip }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <span>{children}</span>
                </TooltipTrigger>
                <TooltipContent>
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default TooltipComponent;

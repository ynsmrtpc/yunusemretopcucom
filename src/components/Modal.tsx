import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/useModalStore";

const Modal = () => {
    const { isOpen, title, description, view, closeModal } = useModalStore();

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="max-h-[90vh] overflow-y-auto" >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {view}
            </DialogContent>
        </Dialog>
    );
};

export default Modal; 
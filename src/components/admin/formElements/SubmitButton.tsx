import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
    isSubmitting: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting }) => (
    <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
            <span className="flex items-center gap-2">
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Kaydediliyor...
            </span>
        ) : (
            <span className="flex items-center gap-2">
                <Save className="w-4 h-4 mr-2" />
                Kaydet
            </span>
        )}
    </Button>
);
export default SubmitButton;
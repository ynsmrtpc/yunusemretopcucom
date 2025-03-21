import { Formik, Form } from 'formik';
import { Button } from "@/components/ui/button";
import { useModalStore } from '@/store/useModalStore';
import TextField from '../formElements/TextField';
import TextareaField from '../formElements/TextAreaField';
import { Education } from '@/types/admin/types';
/* 
import * as Yup from 'yup';
const validationSchema = Yup.object({
    school: Yup.string().required('Okul adı zorunludur'),
    degree: Yup.string().required('Derece zorunludur'),
    date: Yup.string().required('Tarih zorunludur'),
    description: Yup.string(),
});
*/
interface EducationFormProps {
    onSubmit: (values: Education) => void;
    initialValues?: {
        school: string;
        degree: string;
        duration: string;
        description?: string;
    };
}

const EducationForm = ({ onSubmit, initialValues }: EducationFormProps) => {
    const { closeModal } = useModalStore();

    const defaultValues = {
        school: '',
        degree: '',
        duration: '',
        description: ''
    };

    return (
        <Formik
            initialValues={initialValues || defaultValues}
            onSubmit={onSubmit}
        >
            <Form className="space-y-4">
                <TextField name="school" label="Okul" required />
                <TextField name="degree" label="Derece/Bölüm" required />
                <TextField name="duration" label="Tarih" required />
                <TextareaField name="description" label="Açıklama" />

                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={closeModal}>
                        İptal
                    </Button>
                    <Button type="submit">Kaydet</Button>
                </div>
            </Form>
        </Formik>
    );
};

export default EducationForm; 
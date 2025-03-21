import { Formik, Form } from 'formik';
import { Button } from "@/components/ui/button";
import { useModalStore } from '@/store/useModalStore';
import TextField from '../formElements/TextField';
import TextareaField from '../formElements/TextAreaField';
import { Experience } from '@/types/admin/types';

/*
import * as Yup from 'yup';
const validationSchema = Yup.object({
    title: Yup.string().required('Başlık zorunludur'),
    company: Yup.string().required('Şirket adı zorunludur'),
    date: Yup.string().required('Tarih zorunludur'),
    description: Yup.string().required('Açıklama zorunludur'),
});
*/

interface ExperienceFormProps {
    onSubmit: (values: Experience) => void;
    initialValues?: {
        position: string;
        company: string;
        duration: string;
        description: string;
    };
}

const ExperienceForm = ({ onSubmit, initialValues }: ExperienceFormProps) => {

    const { closeModal } = useModalStore();
    const defaultValues = {
        position: '',
        company: '',
        duration: '',
        description: ''
    };

    return (
        <Formik
            initialValues={initialValues || defaultValues}
            onSubmit={onSubmit}
        >
            <Form className="space-y-4">
                <TextField name="position" label="Pozisyon" required />
                <TextField name="company" label="Şirket" required />
                <TextField name="duration" label="Tarih" required />
                <TextareaField name="description" label="Açıklama" required />

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

export default ExperienceForm; 
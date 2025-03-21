import { Formik, Form } from 'formik';
import { Button } from "@/components/ui/button";
import { useModalStore } from '@/store/useModalStore';
import TextField from '../formElements/TextField';
import { Certification } from '@/types/admin/types';

/* import * as Yup from 'yup';

const validationSchema = Yup.object({
    name: Yup.string().required('Sertifika adı zorunludur'),
    issuer: Yup.string().required('Veren kurum zorunludur'),
    date: Yup.string().required('Tarih zorunludur'),
    url: Yup.string().url('Geçerli bir URL giriniz'),
}); */

interface CertificateFormProps {
    onSubmit: (values: Certification) => void;
    initialValues?: {
        name: string;
        issuer: string;
        year: string;
        url?: string;
    };
}

const CertificateForm = ({ onSubmit, initialValues }: CertificateFormProps) => {
    const { closeModal } = useModalStore();

    const defaultValues = {
        name: '',
        issuer: '',
        year: '',
        url: ''
    };

    return (
        <Formik
            initialValues={initialValues || defaultValues}
            onSubmit={onSubmit}
        >
            <Form className="space-y-4">
                <TextField name="name" label="Sertifika Adı" required />
                <TextField name="issuer" label="Veren Kurum" required />
                <TextField name="year" label="Tarih" required />
                <TextField name="url" label="Sertifika URL" />

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

export default CertificateForm; 
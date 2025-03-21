// src/components/forms/BlogForm.tsx
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from "@/components/ui/button";
import { useModalStore } from '@/store/useModalStore';
import TextField from '@/components/admin/formElements/TextField';
import TextareaField from '@/components/admin/formElements/TextAreaField';

interface BlogFormValues {
    title: string;
    content: string;
    excerpt: string;
}

const validationSchema = Yup.object({
    title: Yup.string().required('Başlık zorunludur'),
    content: Yup.string().required('İçerik zorunludur'),
    excerpt: Yup.string().required('Özet zorunludur'),
});

const BlogForm = () => {
    const { closeModal } = useModalStore();

    const initialValues: BlogFormValues = {
        title: '',
        content: '',
        excerpt: '',
    };

    const handleSubmit = async (values: BlogFormValues) => {
        try {
            // API çağrısı yapılabilir
            console.log(values);
            closeModal();
        } catch (error) {
            console.error('Blog oluşturulurken hata:', error);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {() => (
                <Form className="space-y-4">
                    <TextField
                        name="title"
                        label="Başlık"
                        required
                    />

                    <TextareaField
                        name="content"
                        label="İçerik"
                        required
                    />

                    <TextareaField
                        name="excerpt"
                        label="Özet"
                        required
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={closeModal}
                        >
                            İptal
                        </Button>
                        <Button type="submit">
                            Kaydet
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default BlogForm;
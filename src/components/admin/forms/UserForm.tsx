import { Formik, Form } from 'formik';
import { Button } from "@/components/ui/button";
import { useModalStore } from '@/store/useModalStore';
import TextField from '../formElements/TextField';
import SelectField from '../formElements/SelectField';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    name: Yup.string().required('İsim zorunludur'),
    email: Yup.string().email('Geçerli bir email adresi giriniz').required('Email zorunludur'),
    password: Yup.string().test('password', 'Şifre en az 6 karakter olmalıdır', function (value) {
        // Eğer düzenleme modundaysa ve şifre boşsa, validasyonu geç
        if (this.parent.isEditing && !value) return true;
        // Yeni kullanıcı oluşturuluyorsa veya şifre değiştiriliyorsa, en az 6 karakter olmalı
        if (value) return value.length >= 6;
        return false;
    }),
    role: Yup.string().required('Rol zorunludur'),
});

interface UserFormValues {
    name: string;
    email: string;
    password: string;
    role: string;
    isEditing?: boolean;
}

interface UserFormProps {
    onSubmit: (values: UserFormValues) => void;
    initialValues?: Partial<UserFormValues>;
}

const UserForm = ({ onSubmit, initialValues }: UserFormProps) => {
    const { closeModal } = useModalStore();
    const isEditing = Boolean(initialValues?.email);

    const defaultValues: UserFormValues = {
        name: initialValues?.name || '',
        email: initialValues?.email || '',
        password: '',
        role: initialValues?.role || 'user',
        isEditing: isEditing, // validasyon için eklendi
    };

    return (
        <Formik
            initialValues={defaultValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {() => (
                <Form className="space-y-4">
                    <TextField name="name" label="İsim" required />
                    <TextField name="email" label="Email" type="email" required />
                    <TextField
                        name="password"
                        label={isEditing ? "Yeni Şifre (Boş bırakılırsa değişmez)" : "Şifre"}
                        type="password"
                        required={!isEditing}
                    />
                    <SelectField
                        name="role"
                        label="Rol"
                        options={[
                            { value: 'user', label: 'Kullanıcı' },
                            { value: 'admin', label: 'Admin' },
                            { value: 'editor', label: 'Editör' },
                        ]}
                    />

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={closeModal}>
                            İptal
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Güncelle' : 'Kaydet'}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default UserForm; 
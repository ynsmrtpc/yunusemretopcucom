import { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { homeService, uploadService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageTitle } from '@/components/admin/AdminPageTitle';
import SubmitButton from '@/components/admin/formElements/SubmitButton';

// Servis tipi
interface Service {
    id?: number;
    title: string;
    description: string;
    icon: string;
}

// Form değerleri için arayüz
interface FormValues {
    hero_title: string;
    hero_subtitle: string;
    hero_image: string | null;
    about_section_title: string;
    about_section_content: string;
    about_section_image: string | null;
    services_section_title: string;
    services: Service[];
}

// Form doğrulama şeması
const validationSchema = Yup.object({
    hero_title: Yup.string().required('Hero başlığı gereklidir'),
    hero_subtitle: Yup.string().required('Hero alt başlığı gereklidir'),
    hero_image: Yup.string().nullable(),
    about_section_title: Yup.string().required('Hakkımda başlığı gereklidir'),
    about_section_content: Yup.string().required('Hakkımda içeriği gereklidir'),
    about_section_image: Yup.string().nullable(),
    services_section_title: Yup.string().required('Servisler başlığı gereklidir'),
    services: Yup.array().of(
        Yup.object({
            id: Yup.number().optional(),
            title: Yup.string().required('Servis başlığı gereklidir'),
            description: Yup.string().required('Servis açıklaması gereklidir'),
            icon: Yup.string().required('Servis ikonu gereklidir')
        })
    )
});

// Servis hata tipi
interface ServiceError {
    title?: string;
    description?: string;
    icon?: string;
}

const AdminHome = () => {
    const [loading, setLoading] = useState(true);
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
    const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);
    const [initialValues, setInitialValues] = useState<FormValues>({
        hero_title: '',
        hero_subtitle: '',
        hero_image: null,
        about_section_title: '',
        about_section_content: '',
        about_section_image: null,
        services_section_title: '',
        services: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await homeService.get();
                if (response.data) {
                    setInitialValues({
                        hero_title: response.data.hero_title || '',
                        hero_subtitle: response.data.hero_subtitle || '',
                        hero_image: response.data.hero_image,
                        about_section_title: response.data.about_section_title || '',
                        about_section_content: response.data.about_section_content || '',
                        about_section_image: response.data.about_section_image,
                        services_section_title: response.data.services_section_title || '',
                        services: response.data.services?.length
                            ? response.data.services
                            : []
                    });

                    if (response.data.hero_image) {
                        setHeroImagePreview(response.data.hero_image);
                    }

                    if (response.data.about_section_image) {
                        setAboutImagePreview(response.data.about_section_image);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Anasayfa verileri alınırken hata oluştu:', error);
                toast.error('Anasayfa verileri alınırken hata oluştu');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleHeroImageChange = (file: File) => {
        setHeroImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setHeroImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAboutImageChange = (file: File) => {
        setAboutImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAboutImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            // Hero görselini yükle
            let heroImageUrl = values.hero_image;
            if (heroImageFile) {
                const heroUploadResponse = await uploadService.uploadSingle(heroImageFile);
                heroImageUrl = heroUploadResponse.data.imageUrl;
            }

            // Hakkımda görselini yükle
            let aboutImageUrl = values.about_section_image;
            if (aboutImageFile) {
                const aboutUploadResponse = await uploadService.uploadSingle(aboutImageFile);
                aboutImageUrl = aboutUploadResponse.data.imageUrl;
            }

            const updateData = {
                ...values,
                hero_image: heroImageUrl,
                about_section_image: aboutImageUrl
            };

            // Anasayfa verilerini güncelle
            await homeService.update(updateData);
            toast.success('Anasayfa içeriği başarıyla güncellendi');
        } catch (error) {
            console.error('Anasayfa içeriği güncellenirken hata oluştu:', error);
            toast.error('Anasayfa içeriği güncellenirken hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ isSubmitting, touched, errors, values, setFieldValue }) => (
                <Form className="grid grid-cols-2 gap-8">
                    <div className="col-span-2 flex items-center justify-between">
                        <AdminPageTitle
                            title="Anasayfa Yönetimi"
                            description="Sitenizin anasayfasını özelleştirin"
                        />
                        <SubmitButton isSubmitting={isSubmitting} />
                    </div>

                    {/* Hero Bölümü */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Bölümü</CardTitle>
                            <CardDescription>
                                Sitenizin anasayfasındaki ilk görünen bölümü düzenleyin
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="hero_title" className="text-sm font-medium">Başlık</label>
                                    <Field
                                        id="hero_title"
                                        name="hero_title"
                                        as={Input}
                                        placeholder="Anasayfa başlığı"
                                        className={`${errors.hero_title && touched.hero_title ? 'border-red-500' : ''}`}
                                    />
                                    {errors.hero_title && touched.hero_title && (
                                        <p className="text-red-500 text-sm">{errors.hero_title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="hero_subtitle" className="text-sm font-medium">Alt Başlık</label>
                                    <Field
                                        id="hero_subtitle"
                                        name="hero_subtitle"
                                        as={Textarea}
                                        placeholder="Anasayfa alt başlığı"
                                        rows={3}
                                        className={`${errors.hero_subtitle && touched.hero_subtitle ? 'border-red-500' : ''}`}
                                    />
                                    {errors.hero_subtitle && touched.hero_subtitle && (
                                        <p className="text-red-500 text-sm">{errors.hero_subtitle}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hero Görseli</label>
                                <ImageUpload
                                    currentImage={heroImagePreview}
                                    onUpload={handleHeroImageChange}
                                    onRemove={() => {
                                        setHeroImagePreview(null);
                                        setHeroImageFile(null);
                                        setFieldValue('hero_image', null);
                                    }}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Önerilen boyut: 1920x1080 piksel. Hero bölümünüzün arka planında görüntülenecektir.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hakkımda Bölümü */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hakkımda Bölümü</CardTitle>
                            <CardDescription>
                                Kendiniz ya da firmanız hakkında bilgileri düzenleyin
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="about_section_title" className="text-sm font-medium">Başlık</label>
                                <Field
                                    id="about_section_title"
                                    name="about_section_title"
                                    as={Input}
                                    placeholder="Hakkımda bölümü başlığı"
                                    className={`${errors.about_section_title && touched.about_section_title ? 'border-red-500' : ''}`}
                                />
                                {errors.about_section_title && touched.about_section_title && (
                                    <p className="text-red-500 text-sm">{errors.about_section_title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="about_section_content" className="text-sm font-medium">İçerik</label>
                                <Field
                                    id="about_section_content"
                                    name="about_section_content"
                                    as={Textarea}
                                    placeholder="Hakkımda bölümü içeriği"
                                    rows={5}
                                    className={`${errors.about_section_content && touched.about_section_content ? 'border-red-500' : ''}`}
                                />
                                {errors.about_section_content && touched.about_section_content && (
                                    <p className="text-red-500 text-sm">{errors.about_section_content}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hakkımda Görseli</label>
                                <ImageUpload
                                    currentImage={aboutImagePreview}
                                    onUpload={handleAboutImageChange}
                                    onRemove={() => {
                                        setAboutImagePreview(null);
                                        setAboutImageFile(null);
                                        setFieldValue('about_section_image', null);
                                    }}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Önerilen boyut: 600x800 piksel. Hakkımda bölümünüzün yanında görüntülenecektir.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Servisler Bölümü */}
                    <Card className='col-span-2'>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Servisler Bölümü</CardTitle>
                                <CardDescription>
                                    Sunduğunuz hizmetleri düzenleyin
                                </CardDescription>
                            </div>
                            <FieldArray name="services">
                                {({ push }) => (
                                    <Button
                                        type="button"
                                        onClick={() => push({ title: '', description: '', icon: 'code' })}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Servis Ekle
                                    </Button>
                                )}
                            </FieldArray>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="services_section_title" className="text-sm font-medium">Bölüm Başlığı</label>
                                <Field
                                    id="services_section_title"
                                    name="services_section_title"
                                    as={Input}
                                    placeholder="Servisler bölümü başlığı"
                                    className={`${errors.services_section_title && touched.services_section_title ? 'border-red-500' : ''}`}
                                />
                                {errors.services_section_title && touched.services_section_title && (
                                    <p className="text-red-500 text-sm">{errors.services_section_title}</p>
                                )}
                            </div>

                            <FieldArray name="services">
                                {({ remove, push }) => (
                                    <div className="grid grid-cols-4 gap-4">
                                        {values.services.map((service, index) => (
                                            <div key={index} className="p-4 border rounded-lg space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-medium">Servis #{index + 1}</h3>
                                                    <Button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Kaldır
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor={`services.${index}.title`}
                                                            className="text-sm font-medium"
                                                        >
                                                            Başlık
                                                        </label>
                                                        <Field
                                                            id={`services.${index}.title`}
                                                            name={`services.${index}.title`}
                                                            as={Input}
                                                            placeholder="Servis başlığı"
                                                            className={`${errors.services &&
                                                                errors.services[index] &&
                                                                typeof errors.services[index] === 'object' &&
                                                                (errors.services[index] as ServiceError).title &&
                                                                touched.services &&
                                                                touched.services[index] &&
                                                                typeof touched.services[index] === 'object' &&
                                                                (touched.services[index] as any).title
                                                                ? 'border-red-500'
                                                                : ''
                                                                }`}
                                                        />
                                                        {errors.services &&
                                                            errors.services[index] &&
                                                            typeof errors.services[index] === 'object' &&
                                                            (errors.services[index] as ServiceError).title &&
                                                            touched.services &&
                                                            touched.services[index] &&
                                                            typeof touched.services[index] === 'object' &&
                                                            (touched.services[index] as any).title && (
                                                                <p className="text-red-500 text-sm">
                                                                    {(errors.services[index] as ServiceError).title}
                                                                </p>
                                                            )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor={`services.${index}.icon`}
                                                            className="text-sm font-medium"
                                                        >
                                                            İkon
                                                        </label>
                                                        <Field
                                                            id={`services.${index}.icon`}
                                                            name={`services.${index}.icon`}
                                                            as={Input}
                                                            placeholder="Material icon ismi (örn: code, design_services)"
                                                            className={`${errors.services &&
                                                                errors.services[index] &&
                                                                typeof errors.services[index] === 'object' &&
                                                                (errors.services[index] as ServiceError).icon &&
                                                                touched.services &&
                                                                touched.services[index] &&
                                                                typeof touched.services[index] === 'object' &&
                                                                (touched.services[index] as any).icon
                                                                ? 'border-red-500'
                                                                : ''
                                                                }`}
                                                        />
                                                        {errors.services &&
                                                            errors.services[index] &&
                                                            typeof errors.services[index] === 'object' &&
                                                            (errors.services[index] as ServiceError).icon &&
                                                            touched.services &&
                                                            touched.services[index] &&
                                                            typeof touched.services[index] === 'object' &&
                                                            (touched.services[index] as any).icon && (
                                                                <p className="text-red-500 text-sm">
                                                                    {(errors.services[index] as ServiceError).icon}
                                                                </p>
                                                            )}
                                                        <p className="text-xs text-muted-foreground">
                                                            <a
                                                                href="https://fonts.google.com/icons"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline"
                                                            >
                                                                Material Icons
                                                            </a> sayfasından ikon ismi seçebilirsiniz.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor={`services.${index}.description`}
                                                        className="text-sm font-medium"
                                                    >
                                                        Açıklama
                                                    </label>
                                                    <Field
                                                        id={`services.${index}.description`}
                                                        name={`services.${index}.description`}
                                                        as={Textarea}
                                                        placeholder="Servis açıklaması"
                                                        rows={3}
                                                        className={`${errors.services &&
                                                            errors.services[index] &&
                                                            typeof errors.services[index] === 'object' &&
                                                            (errors.services[index] as ServiceError).description &&
                                                            touched.services &&
                                                            touched.services[index] &&
                                                            typeof touched.services[index] === 'object' &&
                                                            (touched.services[index] as any).description
                                                            ? 'border-red-500'
                                                            : ''
                                                            }`}
                                                    />
                                                    {errors.services &&
                                                        errors.services[index] &&
                                                        typeof errors.services[index] === 'object' &&
                                                        (errors.services[index] as ServiceError).description &&
                                                        touched.services &&
                                                        touched.services[index] &&
                                                        typeof touched.services[index] === 'object' &&
                                                        (touched.services[index] as any).description && (
                                                            <p className="text-red-500 text-sm">
                                                                {(errors.services[index] as ServiceError).description}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        ))}

                                        {values.services.length === 0 && (
                                            <div className="text-center p-6 border border-dashed rounded-lg">
                                                <p className="text-muted-foreground mb-3">Henüz servis eklenmemiş</p>
                                                <Button
                                                    type="button"
                                                    onClick={() => push({ title: '', description: '', icon: 'code' })}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Servis Ekle
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </FieldArray>
                        </CardContent>
                    </Card>
                </Form>
            )}
        </Formik>
    );
};

export default AdminHome; 
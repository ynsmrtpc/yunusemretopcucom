import { useState, useEffect } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { metaService } from '@/services/api';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import SubmitButton from "@/components/admin/formElements/SubmitButton";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import TextField from "@/components/admin/formElements/TextField";
import TextAreaField from "@/components/admin/formElements/TextAreaField";
import { AxiosError } from 'axios';

interface MetaSettings {
    id: number;
    site_title: string;
    site_description: string;
    site_keywords: string;
    og_image: string | null;
    favicon: string | null;
    twitter_handle: string;
    facebook_app_id: string;
    google_analytics_id: string;
}

/*
const validationSchema = Yup.object().shape({
    site_title: Yup.string(),
    site_description: Yup.string(),
    site_keywords: Yup.string(),
    twitter_handle: Yup.string(),
    facebook_app_id: Yup.string(),
    google_analytics_id: Yup.string(),
});
*/

const MetaSettings = () => {
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState<MetaSettings>({
        id: 0,
        site_title: '',
        site_description: '',
        site_keywords: '',
        og_image: null,
        favicon: null,
        twitter_handle: '',
        facebook_app_id: '',
        google_analytics_id: '',
    });

    const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [ogImageFile, setOgImageFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchMetaSettings = async () => {
            try {
                const { data } = await metaService.get();
                setInitialValues(data);

                // Önizlemeler için URL'leri ayarla
                if (data.og_image) {
                    setOgImagePreview(data.og_image);
                }
                if (data.favicon) {
                    setFaviconPreview(data.favicon);
                }
            } catch (error) {
                console.error('Meta ayarları yüklenirken hata:', error);
                toast.error('Meta ayarları yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchMetaSettings();
    }, []);

    const handleOgImageChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
        const file = event.currentTarget.files?.[0];
        if (file) {
            setOgImageFile(file);
            setFieldValue('og_image', file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOgImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
        const file = event.currentTarget.files?.[0];
        if (file) {
            setFaviconFile(file);
            setFieldValue('favicon', file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values: MetaSettings, { setSubmitting }: FormikHelpers<MetaSettings>) => {
        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('site_title', values.site_title);
            formData.append('site_description', values.site_description);
            formData.append('site_keywords', values.site_keywords || '');
            formData.append('twitter_handle', values.twitter_handle || '');
            formData.append('facebook_app_id', values.facebook_app_id || '');
            formData.append('google_analytics_id', values.google_analytics_id || '');


            if (ogImageFile) {
                formData.append('og_image', ogImageFile);
            }
            if (faviconFile) {
                formData.append('favicon', faviconFile);
            }

            const response = await metaService.update(formData);

            toast.success('Meta ayarları başarıyla güncellendi');
        } catch (error) {
            console.error('Meta ayarları güncellenirken hata:', error);
            if (error instanceof AxiosError && error.response) {
                console.error('Hata detayı:', error.response.data);
                console.error('Hata durumu:', error.response.status);
            }
            toast.error('Meta ayarları güncellenirken bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-8">
                <AdminPageTitle title="Meta Ayarları" />
                <Card>
                    <CardHeader>
                        <CardTitle>Meta Ayarları Yükleniyor</CardTitle>
                        <CardDescription>Lütfen bekleyin...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (

        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ isSubmitting, setFieldValue }) => (
                <Form className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 flex items-center justify-between">
                        <AdminPageTitle title="Meta Ayarları" description="Meta bilgilerini özelleştirin" />
                        <SubmitButton isSubmitting={isSubmitting} />
                    </div>

                    <Card>
                        <CardHeader className='text-xl text-primary-muted'>Bilgiler</CardHeader>
                        <CardContent className="space-y-2">
                            <TextField
                                name="site_title"
                                label="Site Başlığı"
                            />
                            <TextAreaField
                                name="site_description"
                                label="Site Açıklaması"
                                rows={3}
                            />

                            <TextField
                                name="site_keywords"
                                label="Anahtar Kelimeler (virgülle ayırın)"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='text-xl text-primary-muted'>Resimler</CardHeader>

                        <CardContent className="space-y-2">
                            <div className="space-y-2">
                                <Label htmlFor="og_image">Sosyal Medya Görseli (OG Image)</Label>
                                <div className="flex items-center gap-4">
                                    {ogImagePreview && (
                                        <div className="relative w-40 h-12 border rounded-md overflow-hidden">
                                            <img
                                                src={ogImagePreview}
                                                alt="Logo Önizleme"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                    )}
                                    <Input
                                        type="file"
                                        id="og_image"
                                        accept="image/*"
                                        onChange={(e) => handleOgImageChange(e, setFieldValue)}
                                        className="cursor-pointer"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Sosyal medyada paylaşıldığında görünecek görsel (1200x630px önerilir)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="favicon">Favicon</Label>

                                <div className="flex items-center gap-4">
                                    {faviconPreview && (
                                        <div className="relative w-40 h-12 border rounded-md overflow-hidden">
                                            <img
                                                src={faviconPreview}
                                                alt="Logo Önizleme"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        id="favicon"
                                        accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
                                        onChange={(e) => handleFaviconChange(e, setFieldValue)}
                                        className="cursor-pointer"
                                    />
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Tarayıcı sekmesinde görünecek ikon (en az 32x32px önerilir)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='text-xl text-primary-muted'>Sosyal Medya Entegrasyonu</CardHeader>

                        <CardContent className="space-y-2">
                            <TextField
                                name="twitter_handle"
                                label="Twitter Kullanıcı Adı"
                            />
                            <TextField
                                name="facebook_app_id"
                                label="Facebook App ID"
                            />
                            <TextField
                                name="google_analytics_id"
                                label="Google Analytics ID"
                            />
                        </CardContent>
                    </Card>
                </Form>
            )}
        </Formik>

    );
};

export default MetaSettings; 
import { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { footerService, uploadService } from "@/services/api";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import SubmitButton from "@/components/admin/formElements/SubmitButton";

// Form validation schema
const validationSchema = Yup.object({
    logo: Yup.string().optional(),
    description: Yup.string().optional(),
    copyright_text: Yup.string().required("Telif hakkı metni gereklidir"),
    navigation_links: Yup.array().of(
        Yup.object({
            id: Yup.number().optional(),
            title: Yup.string().required("Başlık gereklidir"),
            url: Yup.string().required("URL gereklidir")
        })
    ),
    social_links: Yup.array().of(
        Yup.object({
            id: Yup.number().optional(),
            platform: Yup.string().required("Platform adı gereklidir"),
            url: Yup.string().required("URL gereklidir"),
            icon: Yup.string().required("İkon gereklidir")
        })
    )
});

// Form değerleri için arayüz
interface FormValues {
    logo: string;
    description: string;
    copyright_text: string;
    navigation_links: Array<{
        id?: number;
        title: string;
        url: string;
    }>;
    social_links: Array<{
        id?: number;
        platform: string;
        url: string;
        icon: string;
    }>;
}

// Navigation link ve Social link hata tipleri
interface NavigationLinkError {
    title?: string;
    url?: string;
}

interface SocialLinkError {
    platform?: string;
    url?: string;
    icon?: string;
}

export const FooterSettings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [initialValues, setInitialValues] = useState<FormValues>({
        logo: "",
        description: "",
        copyright_text: "© 2024 Tüm hakları saklıdır.",
        navigation_links: [
            { title: "", url: "" }
        ],
        social_links: [
            { platform: "", url: "", icon: "" }
        ]
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await footerService.get();

                if (data) {
                    // Form verilerini ayarla
                    const formData = {
                        logo: data.logo || "",
                        description: data.description || "",
                        copyright_text: data.copyright_text || "© 2024 Tüm hakları saklıdır.",
                        navigation_links: data.navigation_links?.length
                            ? data.navigation_links
                            : [{ title: "", url: "" }],
                        social_links: data.social_links?.length
                            ? data.social_links
                            : [{ platform: "", url: "", icon: "" }]
                    };

                    setInitialValues(formData);

                    // Logo önizlemesini ayarla
                    if (data.logo) {
                        setLogoPreview(data.logo);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error("Footer verileri yüklenirken hata:", error);
                toast.error("Footer verileri yüklenirken bir hata oluştu.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values: FormValues, { setSubmitting: formikSetSubmitting }: FormikHelpers<FormValues>) => {
        setSubmitting(true);
        try {
            // Logo yükleme işlemi
            let logoUrl = values.logo;
            if (logoFile) {
                const uploadResponse = await uploadService.uploadSingle(logoFile);
                logoUrl = uploadResponse.data.imageUrl;
            }

            const updateData = {
                ...values,
                logo: logoUrl
            };

            // Footer verilerini güncelle
            await footerService.update(updateData);

            toast.success("Footer ayarları başarıyla güncellendi.");
        } catch (error) {
            console.error("Footer ayarları güncellenirken hata:", error);
            toast.error("Footer ayarları güncellenirken bir hata oluştu.");
        } finally {
            formikSetSubmitting(false);
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
            {({ isSubmitting, touched, errors, setFieldValue, values }) => (
                <Form className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 flex items-center justify-between">
                        <AdminPageTitle title="Footer Ayarları" description="Site alt bilgisini özelleştirin" />
                        <SubmitButton isSubmitting={isSubmitting} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Genel Ayarlar</CardTitle>
                            <CardDescription>
                                Footer'da görüntülenecek genel bilgileri buradan ayarlayabilirsiniz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Logo</label>
                                <div className="flex items-center gap-4">
                                    {logoPreview && (
                                        <div className="relative w-40 h-12 border rounded-md overflow-hidden">
                                            <img
                                                src={logoPreview}
                                                alt="Logo Önizleme"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleLogoChange(e, setFieldValue)}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Önerilen boyut: 200x50 piksel. Şeffaf PNG tercih edilir.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="description"
                                    className="text-sm font-medium leading-none"
                                >
                                    Açıklama
                                </label>
                                <Field
                                    id="description"
                                    name="description"
                                    as={Textarea}
                                    placeholder="Footer açıklaması"
                                    className={`min-h-[100px] ${errors.description && touched.description ? 'border-red-500' : ''}`}
                                />
                                {errors.description && touched.description && (
                                    <p className="text-red-500 text-sm">{errors.description}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Bu açıklama footer'ın sol tarafında görüntülenecektir.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="copyright_text"
                                    className="text-sm font-medium leading-none"
                                >
                                    Telif Hakkı Metni
                                </label>
                                <Field
                                    id="copyright_text"
                                    name="copyright_text"
                                    as={Input}
                                    placeholder="© 2024 Tüm hakları saklıdır."
                                    className={`${errors.copyright_text && touched.copyright_text ? 'border-red-500' : ''}`}
                                />
                                {errors.copyright_text && touched.copyright_text && (
                                    <p className="text-red-500 text-sm">{errors.copyright_text}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Bu metin footer'ın en altında görüntülenecektir.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Navigasyon Linkleri</CardTitle>
                            <CardDescription>
                                Footer'da görüntülenecek hızlı bağlantıları buradan yönetebilirsiniz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldArray name="navigation_links">
                                {({ remove, push }) => (
                                    <div className="space-y-4">
                                        {values.navigation_links.map((link, index) => (
                                            <div key={index} className="flex items-end gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <label
                                                        htmlFor={`navigation_links.${index}.title`}
                                                        className="text-sm font-medium leading-none"
                                                    >
                                                        Başlık
                                                    </label>
                                                    <Field
                                                        name={`navigation_links.${index}.title`}
                                                        as={Input}
                                                        placeholder="Link Başlığı"
                                                    />
                                                    {errors.navigation_links &&
                                                        errors.navigation_links[index] &&
                                                        typeof errors.navigation_links[index] === 'object' &&
                                                        (errors.navigation_links[index] as NavigationLinkError).title &&
                                                        touched.navigation_links &&
                                                        touched.navigation_links[index] &&
                                                        typeof touched.navigation_links[index] === 'object' &&
                                                        (touched.navigation_links[index] as any).title && (
                                                            <p className="text-red-500 text-sm">
                                                                {(errors.navigation_links[index] as NavigationLinkError).title}
                                                            </p>
                                                        )}
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <label
                                                        htmlFor={`navigation_links.${index}.url`}
                                                        className="text-sm font-medium leading-none"
                                                    >
                                                        URL
                                                    </label>
                                                    <Field
                                                        name={`navigation_links.${index}.url`}
                                                        as={Input}
                                                        placeholder="/sayfa-url"
                                                    />
                                                    {errors.navigation_links &&
                                                        errors.navigation_links[index] &&
                                                        typeof errors.navigation_links[index] === 'object' &&
                                                        (errors.navigation_links[index] as NavigationLinkError).url &&
                                                        touched.navigation_links &&
                                                        touched.navigation_links[index] &&
                                                        typeof touched.navigation_links[index] === 'object' &&
                                                        (touched.navigation_links[index] as any).url && (
                                                            <p className="text-red-500 text-sm">
                                                                {(errors.navigation_links[index] as NavigationLinkError).url}
                                                            </p>
                                                        )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (values.navigation_links.length > 1) {
                                                            remove(index);
                                                        }
                                                    }}
                                                    disabled={values.navigation_links.length <= 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => push({ title: "", url: "" })}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Yeni Link Ekle
                                        </Button>
                                    </div>
                                )}
                            </FieldArray>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sosyal Medya Linkleri</CardTitle>
                            <CardDescription>
                                Footer'da görüntülenecek sosyal medya bağlantılarını buradan yönetebilirsiniz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldArray name="social_links">
                                {({ remove, push }) => (
                                    <div className="space-y-4">
                                        {values.social_links.map((link, index) => (
                                            <div key={index} className="space-y-4 p-4 border rounded-md">
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor={`social_links.${index}.platform`}
                                                        className="text-sm font-medium leading-none"
                                                    >
                                                        Platform
                                                    </label>
                                                    <Field
                                                        name={`social_links.${index}.platform`}
                                                        as={Input}
                                                        placeholder="Örn: Twitter, Facebook, Instagram"
                                                    />
                                                    {errors.social_links &&
                                                        errors.social_links[index] &&
                                                        typeof errors.social_links[index] === 'object' &&
                                                        (errors.social_links[index] as SocialLinkError).platform &&
                                                        touched.social_links &&
                                                        touched.social_links[index] &&
                                                        typeof touched.social_links[index] === 'object' &&
                                                        (touched.social_links[index] as any).platform && (
                                                            <p className="text-red-500 text-sm">
                                                                {(errors.social_links[index] as SocialLinkError).platform}
                                                            </p>
                                                        )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor={`social_links.${index}.url`}
                                                        className="text-sm font-medium leading-none"
                                                    >
                                                        URL
                                                    </label>
                                                    <Field
                                                        name={`social_links.${index}.url`}
                                                        as={Input}
                                                        placeholder="https://twitter.com/ynsmrtpc"
                                                    />
                                                    {errors.social_links &&
                                                        errors.social_links[index] &&
                                                        typeof errors.social_links[index] === 'object' &&
                                                        (errors.social_links[index] as SocialLinkError).url &&
                                                        touched.social_links &&
                                                        touched.social_links[index] &&
                                                        typeof touched.social_links[index] === 'object' &&
                                                        (touched.social_links[index] as any).url && (
                                                            <p className="text-red-500 text-sm">
                                                                {(errors.social_links[index] as SocialLinkError).url}
                                                            </p>
                                                        )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor={`social_links.${index}.icon`}
                                                        className="text-sm font-medium leading-none"
                                                    >
                                                        İkon (Lucide Icon Adı)
                                                    </label>
                                                    <Field
                                                        name={`social_links.${index}.icon`}
                                                        as={Input}
                                                        placeholder="twitter, facebook, instagram"
                                                    />
                                                    {errors.social_links &&
                                                        errors.social_links[index] &&
                                                        typeof errors.social_links[index] === 'object' &&
                                                        (errors.social_links[index] as SocialLinkError).icon &&
                                                        touched.social_links &&
                                                        touched.social_links[index] &&
                                                        typeof touched.social_links[index] === 'object' &&
                                                        (touched.social_links[index] as any).icon && (
                                                            <p className="text-red-500 text-sm">
                                                                {(errors.social_links[index] as SocialLinkError).icon}
                                                            </p>
                                                        )}
                                                    <p className="text-sm text-muted-foreground">
                                                        Lucide ikonları için isimler: twitter, facebook, instagram, github, linkedin vb.
                                                    </p>
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (values.social_links.length > 1) {
                                                                remove(index);
                                                            }
                                                        }}
                                                        disabled={values.social_links.length <= 1}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Sil
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => push({ platform: "", url: "", icon: "" })}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Yeni Sosyal Medya Ekle
                                        </Button>
                                    </div>
                                )}
                            </FieldArray>
                        </CardContent>
                    </Card>

                    <div className="col-span-2 flex justify-end mt-4">
                        <Button type="submit" disabled={isSubmitting || submitting}>
                            {(isSubmitting || submitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default FooterSettings; 
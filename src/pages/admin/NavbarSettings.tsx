import { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { navbarService, uploadService } from "@/services/api";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import SubmitButton from "@/components/admin/formElements/SubmitButton";

// Form validation schema
const validationSchema = Yup.object({
    site_title: Yup.string().required("Site başlığı gereklidir"),
    logo: Yup.string().optional(),
    navigation_links: Yup.array().of(
        Yup.object({
            id: Yup.number().optional(),
            title: Yup.string().required("Başlık gereklidir"),
            url: Yup.string().required("URL gereklidir"),
            order_index: Yup.number().optional()
        })
    )
});

// Form değerleri için arayüz
interface FormValues {
    site_title: string;
    logo: string;
    navigation_links: Array<{
        id?: number;
        title: string;
        url: string;
        order_index?: number;
    }>;
}

// Navigation link hata tipi
interface NavigationLinkError {
    title?: string;
    url?: string;
}

export const NavbarSettings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [initialValues, setInitialValues] = useState<FormValues>({
        site_title: "",
        logo: "",
        navigation_links: [
            { title: "", url: "", order_index: 0 }
        ]
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await navbarService.get();

                if (data) {
                    // Form verilerini ayarla
                    const formData = {
                        site_title: data.site_title || "",
                        logo: data.logo || "",
                        navigation_links: data.navigation_links?.length
                            ? data.navigation_links.map((link: any, index: number) => ({
                                ...link,
                                order_index: link.order_index || index
                            }))
                            : [{ title: "", url: "", order_index: 0 }]
                    };

                    setInitialValues(formData);

                    // Logo önizlemesini ayarla
                    if (data.logo) {
                        setLogoPreview(data.logo);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error("Navbar verileri yüklenirken hata:", error);
                toast.error("Navbar verileri yüklenirken bir hata oluştu.");
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

            // Navbar verilerini güncelle
            await navbarService.update(updateData);

            toast.success("Navbar ayarları başarıyla güncellendi.");
        } catch (error) {
            console.error("Navbar ayarları güncellenirken hata:", error);
            toast.error("Navbar ayarları güncellenirken bir hata oluştu.");
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
                        <AdminPageTitle title="Navbar Ayarları" description="Site üst menüsünü özelleştirin" />
                        <SubmitButton isSubmitting={isSubmitting} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Genel Ayarlar</CardTitle>
                            <CardDescription>
                                Navbar'da görüntülenecek genel bilgileri buradan ayarlayabilirsiniz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="site_title"
                                    className="text-sm font-medium leading-none"
                                >
                                    Site Başlığı
                                </label>
                                <Field
                                    name="site_title"
                                    as={Input}
                                    placeholder="Site Başlığı"
                                    className={`${errors.site_title && touched.site_title ? 'border-red-500' : ''}`}
                                />
                                {errors.site_title && touched.site_title && (
                                    <p className="text-red-500 text-sm">{errors.site_title}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Bu başlık, logo olmadığında navbar'da görüntülenecektir.
                                </p>
                            </div>

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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Navigasyon Linkleri</CardTitle>
                            <CardDescription>
                                Navbar'da görüntülenecek menü öğelerini buradan yönetebilirsiniz.
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
                                                        placeholder="Menü Başlığı"
                                                        className={`${errors.navigation_links?.[index] &&
                                                            typeof errors.navigation_links[index] === 'object' &&
                                                            (errors.navigation_links[index] as NavigationLinkError).title &&
                                                            touched.navigation_links?.[index] &&
                                                            typeof touched.navigation_links[index] === 'object' &&
                                                            (touched.navigation_links[index] as any).title
                                                            ? 'border-red-500'
                                                            : ''
                                                            }`}
                                                    />
                                                    {errors.navigation_links?.[index] &&
                                                        typeof errors.navigation_links[index] === 'object' &&
                                                        (errors.navigation_links[index] as NavigationLinkError).title &&
                                                        touched.navigation_links?.[index] &&
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
                                                        className={`${errors.navigation_links?.[index] &&
                                                            typeof errors.navigation_links[index] === 'object' &&
                                                            (errors.navigation_links[index] as NavigationLinkError).url &&
                                                            touched.navigation_links?.[index] &&
                                                            typeof touched.navigation_links[index] === 'object' &&
                                                            (touched.navigation_links[index] as any).url
                                                            ? 'border-red-500'
                                                            : ''
                                                            }`}
                                                    />
                                                    {errors.navigation_links?.[index] &&
                                                        typeof errors.navigation_links[index] === 'object' &&
                                                        (errors.navigation_links[index] as NavigationLinkError).url &&
                                                        touched.navigation_links?.[index] &&
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
                                            onClick={() => push({ title: "", url: "", order_index: values.navigation_links.length })}
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


                </Form>
            )}
        </Formik>
    );
};

export default NavbarSettings; 
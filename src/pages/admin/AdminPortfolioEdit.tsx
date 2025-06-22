import { Link,  useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { projectService } from "@/services/api.ts";
import { toast } from "sonner";
import { ProjectPost } from "@/types/admin/types.ts";
import { Formik, Form, FormikHelpers } from "formik";
import SubmitButton from "@/components/admin/formElements/SubmitButton";
import TextField from "@/components/admin/formElements/TextField";
import TextAreaField from "@/components/admin/formElements/TextAreaField";
import SelectField from "@/components/admin/formElements/SelectField";
import ImageUpload from "@/components/admin/formElements/ImageUpload";
import { processFormImages } from "@/utils/uploadHelpers";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import EditorContent from "@/components/admin/Editor/EditorContent";

interface ContentProps {
    htmlData: string;
    textData: string;
}

const AdminPortfolioEdit = () => {
    const { id: slug } = useParams<{ id: string }>();
    const isEditing = Boolean(slug);
    const [contentValues, setContentValues] = useState<ContentProps>({ htmlData: '', textData: '' });
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<ProjectPost | null>(null);

    useEffect(() => {
        if (isEditing && slug) {
            fetchProject(slug);
        } else {
            setLoading(false);
        }
    }, [slug, isEditing]);

    const fetchProject = async (projectSlug: string) => {
        setLoading(true);
        try {
            const response = await projectService.getById(projectSlug);
            response.data.technologies = JSON.parse(response.data.technologies);
            setProject(response.data);
            setContentValues({
                htmlData: response.data.content || '',
                textData: response.data.plaintext || ''
            });
        } catch (error) {
            console.error("Error fetching project:", error);
            toast.error("Proje verisi alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    const initialValues: Omit<ProjectPost, 'content' | 'plaintext'> = {
        title: project?.title || "",
        description: project?.description || "",
        category: project?.category || "",
        technologies: project?.technologies || [],
        status: project?.status || "in_progress",
        client: project?.client || "",
        duration: project?.duration || "",
        year: project?.year || "",
        live_url: project?.live_url || "",
        github_url: project?.github_url || "",
        coverImage: project?.coverImage || "",
        galleryImages: project?.galleryImages || [],
        slug: project?.slug || "",
    };

    const handleSubmit = async (
        values: ProjectPost,
        { setSubmitting }: FormikHelpers<ProjectPost>
    ) => {
        try {
            toast.loading("Proje kaydediliyor...");

            const content = contentValues.htmlData || "";
            const plaintext = contentValues.textData || "";

            let payload: ProjectPost = {
                ...values,
                content,
                plaintext
            };

            payload = await processFormImages(payload);

            let result;
            if (isEditing) {
                result = await projectService.update(slug!, payload);
            } else {
                result = await projectService.create(payload);
            }

            const { message } = result.data || "";

            toast.dismiss();

            if (result.status === 200 || result.status === 201) {
                toast.success(message);
            } else {
                toast.error(message);
            }
        } catch (error) {
            toast.dismiss();

            console.error("Error submitting form:", error);
            toast.error("Proje kaydedilemedi!");
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
            enableReinitialize
            initialValues={initialValues as never}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin/portfolio">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <AdminPageTitle
                                title={isEditing ? "Projeyi Düzenle" : "Yeni Proje"}
                            />
                        </div>
                        <SubmitButton isSubmitting={isSubmitting} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Ana İçerik */}
                        <div className="lg:col-span-2 space-y-8">
                            <TextField name="title" label="Proje Başlığı" required />
                            <div className="relative min-h-[500px] border rounded-lg">
                                {!loading && (
                                    <EditorContent
                                        initialHtml={project?.content || ''}
                                        onContentChange={(htmlData, textData) => {
                                            setContentValues({ htmlData, textData });
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Yan Panel */}
                        <div className="space-y-6">
                            <TextAreaField name="description" label="Açıklama" rows={8} required />

                            <div className="space-y-2">
                                <label className="text-sm">Kategori</label>
                                <SelectField
                                    name="category"
                                    label="Kategori"
                                    options={[
                                        { value: "Web Uygulama", label: "Web Uygulama" },
                                        { value: "Web Sitesi", label: "Web Sitesi" },
                                        { value: "Mobil Uygulama", label: "Mobil Uygulama" },
                                        { value: "Dashboard", label: "Dashboard" },
                                    ]}
                                />
                            </div>

                            <TextField name="technologies" label="Teknolojiler" required />

                            <div className="space-y-2">
                                <label className="text-sm">Durum</label>
                                <SelectField
                                    name="status"
                                    label="Durum"
                                    options={[
                                        { value: "in_progress", label: "Devam Ediyor" },
                                        { value: "completed", label: "Tamamlandı" },
                                    ]}
                                />
                            </div>

                            <TextField name="client" label="Müşteri" />

                            <div className="grid grid-cols-2 gap-4">
                                <TextField name="duration" label="Süre" />
                                <TextField name="year" label="Yıl" />
                            </div>

                            <TextField name="live_url" label="Canlı URL" />
                            <TextField name="github_url" label="GitHub URL" />

                            {/* Kapak Resmi */}
                            <ImageUpload
                                label="Kapak Resmi"
                                name="coverImage"
                                value={values.coverImage}
                                onChange={(name, value) => setFieldValue(name, value)}
                            />

                            {/* Galeri Resimleri */}
                            <ImageUpload
                                label="Galeri Resimleri"
                                name="galleryImages"
                                multiple
                                value={values.galleryImages}
                                onChange={(name, value) => setFieldValue(name, value)}
                            />
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default AdminPortfolioEdit;

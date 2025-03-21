import TextField from "@/components/admin/formElements/TextField";
import TextAreaField from "@/components/admin/formElements/TextAreaField";
import SelectField from "@/components/admin/formElements/SelectField";
import SubmitButton from "@/components/admin/formElements/SubmitButton";
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Formik, Form, FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { blogService } from "@/services/api";
import { BlogPost } from "@/types/admin/types";
import { toast } from "sonner"
import ImageUpload from "@/components/admin/formElements/ImageUpload";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import EditorContent from "@/components/admin/Editor/EditorContent";
import { processFormImages } from "@/utils/uploadHelpers";

interface ContentProps {
    htmlData: string;
    textData: string;
    title: string;
}

const AdminBlogEdit: React.FC = () => {
    const { id: slug } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(slug);
    const [contentValues, setContentValues] = useState<ContentProps>({ htmlData: '', textData: '', title: '' });
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<BlogPost | null>(null);

    useEffect(() => {
        if (slug) {
            fetchBlog();
        }
        setLoading(false)
    }, [slug]);

    const fetchBlog = async () => {
        try {
            const response = await blogService.getById(slug!);
            setBlog(response.data);
            setLoading(false)
        } catch (error) {
            console.error("Error fetching blog:", error);
            toast.error("Blog verisi alınamadı.");
        }
    };

    const initialValues: BlogPost = {
        title: blog?.title || "",
        excerpt: blog?.excerpt || "",
        status: blog?.status || "draft",
        content: blog?.content || "",
        image: blog?.image || "",
        plaintext: blog?.plaintext || "",
        coverImage: blog?.coverImage || "",
        galleryImages: blog?.galleryImages || [],
    };

    const handleSubmit = async (
        values: BlogPost,
        { setSubmitting }: FormikHelpers<BlogPost>
    ) => {
        try {
            // Form gönderilmeden önce yükleme durumunu göster
            toast.loading("Blog kaydediliyor...");

            // Editor içeriğini al
            const content = contentValues.htmlData || "";
            const plaintext = contentValues.textData || "";
            const title = contentValues.title || "";

            // Form değerlerini güncelle
            let payload: BlogPost = { ...values, content, plaintext, title };

            // Dosya yükleme işlemlerini gerçekleştir
            payload = await processFormImages(payload);

            //API'ye gönder
            let result;
            if (isEditing) {
                result = await blogService.update(slug!, payload);
            } else {
                result = await blogService.create(payload);
            }

            const { message } = result.data || '';

            // Yükleme toast'ını kapat
            toast.dismiss();

            if (result.status === 200 || result.status === 201) {
                toast.success(message);
                navigate("/admin/blog");
            } else {
                toast.error(message);
            }
        } catch (error) {
            // Yükleme toast'ını kapat
            toast.dismiss();

            console.error("Error submitting form:", error);
            toast.error("Blog kaydedilemedi!");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
            {
                ({ isSubmitting, setFieldValue, values }) => (
                    <Form className="space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/admin/blog">
                                    <Button variant="ghost" size="icon">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <AdminPageTitle
                                    title={isEditing ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}
                                />
                            </div>
                            <SubmitButton isSubmitting={isSubmitting} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* <TextField name="title" label="Başlık" required /> */}
                                <div className="relative min-h-[500px] border rounded-lg">
                                    {blog && <EditorContent initialHtml={blog?.content} onContentChange={values => setContentValues(values)} />}
                                    {!slug && <EditorContent initialHtml={blog?.content} onContentChange={values => setContentValues(values)} />}
                                </div>

                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <TextAreaField name="excerpt" label="Özet" rows={3} required />
                                <SelectField
                                    name="status"
                                    label="Durum"
                                    options={[
                                        { value: "draft", label: "Taslak" },
                                        { value: "published", label: "Yayında" },
                                    ]}
                                />


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
                )
            }
        </Formik>
    );
};

export default AdminBlogEdit;
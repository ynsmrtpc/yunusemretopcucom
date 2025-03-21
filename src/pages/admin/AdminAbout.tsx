import { Button } from "../../components/ui/button";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from "react";
import { AboutData, Experience, Education, Certification } from "@/types/admin/types.ts";
import { aboutService } from "@/services/api.ts";
import { toast } from "sonner";
import { Form, Formik, FormikHelpers } from "formik";
import EditorMenu from "@/components/admin/EditorMenu.tsx";
import TextAreaField from "@/components/admin/formElements/TextAreaField";
import SubmitButton from "@/components/admin/formElements/SubmitButton";
import { useModalStore } from '@/store/useModalStore';
import ExperienceForm from '@/components/admin/forms/ExperienceForm';
import EducationForm from '@/components/admin/forms/EducationForm';
import CertificateForm from '@/components/admin/forms/CertificateForm';
import { MdDelete, MdEdit } from "react-icons/md";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { Loader2 } from "lucide-react";

const AdminAbout = () => {
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const { openModal, closeModal } = useModalStore();

    useEffect(() => {
        fetchAbout();
    }, []);

    const fetchAbout = async () => {
        try {
            const response = await aboutService.get();
            setAboutData(response.data);
        } catch (error) {
            console.error("Error fetching about:", error);
            toast.error("About verisi alınamadı.");
        }
    };

    const editor = useEditor({
        extensions: [StarterKit],
        content: aboutData?.content || "",
        editorProps: {
            attributes: {
                class: "min-h-[500px] p-4 prose prose-sm max-w-none focus:outline-none focus:ring-1 focus:ring-gray-900 rounded-lg",
            },
        },
    });

    useEffect(() => {
        if (editor && aboutData) {
            editor.commands.setContent(aboutData.content || "");
        }
    }, [editor, aboutData]);

    if (!aboutData) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const initialValues: AboutData = {
        content: aboutData?.content || "",
        skills: aboutData?.skills || [""],
        experience: aboutData?.experience || [],
        education: aboutData?.education || [],
        certifications: aboutData?.certifications || [],
        plaintext: aboutData?.plaintext || "",
    };

    const handleSubmit = async (
        values: AboutData,
        { setSubmitting }: FormikHelpers<AboutData>
    ) => {
        try {
            const content = editor?.getHTML() || "";
            const plaintext = editor?.getText() || "";
            const payload: AboutData = { ...values, content, plaintext };
            const result = await aboutService.update(payload);

            const { message } = result.data || '';

            if (result.status === 200 || result.status === 201) {
                toast.success(message);
            } else {
                toast.error(message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Bilgiler kaydedilemedi!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddExperience = (values: Experience) => {
        setAboutData(prev => ({
            ...prev!,
            experience: [...prev!.experience, {
                company: values.company,
                position: values.position,
                duration: values.duration,
                description: values.description
            }]
        }));
        closeModal();
    };

    const handleAddEducation = (values: Education) => {
        setAboutData(prev => ({
            ...prev!,
            education: [...prev!.education, {
                school: values.school,
                degree: values.degree,
                duration: values.duration,
                description: values.description
            }]
        }));
        closeModal();
    };

    const handleAddCertificate = (values: Certification) => {
        setAboutData(prev => ({
            ...prev!,
            certifications: [...prev!.certifications, {
                name: values.name,
                issuer: values.issuer,
                year: values.year,
                url: values.url
            }]
        }));
        closeModal();
    };

    const handleDeleteExperience = (index: number) => {
        setAboutData(prev => ({
            ...prev!,
            experience: prev!.experience.filter((_, i) => i !== index)
        }));
        toast.success("Deneyim başarıyla silindi");
    };

    const handleDeleteEducation = (index: number) => {
        setAboutData(prev => ({
            ...prev!,
            education: prev!.education.filter((_, i) => i !== index)
        }));
        toast.success("Eğitim başarıyla silindi");
    };

    const handleDeleteCertificate = (index: number) => {
        setAboutData(prev => ({
            ...prev!,
            certifications: prev!.certifications.filter((_, i) => i !== index)
        }));
        toast.success("Sertifika başarıyla silindi");
    };

    const handleEditExperience = (experience: Experience, index: number) => {
        openModal({
            title: "Deneyim Düzenle",
            description: "Deneyim bilgilerini güncelleyin",
            view: <ExperienceForm
                onSubmit={(values) => {
                    setAboutData(prev => ({
                        ...prev!,
                        experience: prev!.experience?.map((exp, i) =>
                            i === index ? values : exp
                        )
                    }));
                    closeModal();
                    toast.success("Deneyim başarıyla güncellendi");
                }}
                initialValues={experience}
            />
        });
    };

    const handleEditEducation = (education: Education, index: number) => {
        openModal({
            title: "Eğitim Düzenle",
            description: "Eğitim bilgilerini güncelleyin",
            view: <EducationForm
                onSubmit={(values) => {
                    setAboutData(prev => ({
                        ...prev!,
                        education: prev!.education.map((edu, i) =>
                            i === index ? values : edu
                        )
                    }));
                    closeModal();
                    toast.success("Eğitim başarıyla güncellendi");
                }}
                initialValues={education}
            />
        });
    };

    const handleEditCertificate = (certificate: Certification, index: number) => {
        openModal({
            title: "Sertifika Düzenle",
            description: "Sertifika bilgilerini güncelleyin",
            view: <CertificateForm
                onSubmit={(values) => {
                    setAboutData(prev => ({
                        ...prev!,
                        certifications: prev!.certifications.map((cert, i) =>
                            i === index ? values : cert
                        )
                    }));
                    closeModal();
                    toast.success("Sertifika başarıyla güncellendi");
                }}
                initialValues={certificate}
            />
        });
    };

    // Deneyim ekleme modalı
    const openExperienceModal = () => {
        openModal({
            title: "Yeni Deneyim Ekle",
            description: "Deneyim bilgilerini doldurun",
            view: <ExperienceForm onSubmit={handleAddExperience} />
        });
    };

    // Eğitim ekleme modalı
    const openEducationModal = () => {
        openModal({
            title: "Yeni Eğitim Ekle",
            description: "Eğitim bilgilerini doldurun",
            view: <EducationForm onSubmit={handleAddEducation} />
        });
    };

    // Sertifika ekleme modalı
    const openCertificateModal = () => {
        openModal({
            title: "Yeni Sertifika Ekle",
            description: "Sertifika bilgilerini doldurun",
            view: <CertificateForm onSubmit={handleAddCertificate} />
        });
    };


    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
            {
                ({ isSubmitting, setFieldValue }) => (
                    <Form className="space-y-8">
                        <div className="flex items-center justify-between">
                            <AdminPageTitle
                                title="Hakkımda Yönetimi"
                                description="Sitenizin hakkımda sayfasını özelleştirin"
                            />
                            <SubmitButton isSubmitting={isSubmitting} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Ana İçerik */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="relative min-h-[500px] border rounded-lg">
                                    <EditorMenu editor={editor} />
                                    <EditorContent
                                        editor={editor}
                                        onBlur={() => setFieldValue("content", editor?.getHTML() || "")}
                                    />
                                </div>
                            </div>

                            {/* Yan Panel */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <TextAreaField name="skills" label="Yetenekler" rows={3} required />
                                    <p className="text-sm text-muted-foreground">
                                        Yetenekleri virgülle ayırarak yazın
                                    </p>
                                </div>

                                {/* Deneyim */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Deneyim</h2>
                                        <Button variant="outline" size="sm" type="button" onClick={openExperienceModal}>
                                            Ekle
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {aboutData?.experience && aboutData.experience.map((exp, index) => (
                                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium">{exp.company}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditExperience(exp, index)}
                                                        >
                                                            <MdEdit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteExperience(index)}
                                                        >
                                                            <MdDelete className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{exp.position}</p>
                                                <p className="text-sm text-muted-foreground">{exp.duration}</p>
                                                <p className="text-sm">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Eğitim */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Eğitim</h2>
                                        <Button variant="outline" size="sm" type="button" onClick={openEducationModal}>
                                            Ekle
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {aboutData.education && aboutData.education.map((edu, index) => (
                                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium">{edu.school}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditEducation(edu, index)}
                                                        >
                                                            <MdEdit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteEducation(index)}
                                                        >
                                                            <MdDelete className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{edu.degree}</p>
                                                <p className="text-sm text-muted-foreground">{edu.duration}</p>
                                                {edu.description && <p className="text-sm">{edu.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sertifikalar */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Sertifikalar</h2>
                                        <Button variant="outline" size="sm" type="button" onClick={openCertificateModal}>
                                            Ekle
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {aboutData.certifications && aboutData.certifications.map((cert, index) => (
                                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium">{cert.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditCertificate(cert, index)}
                                                        >
                                                            <MdEdit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteCertificate(index)}
                                                        >
                                                            <MdDelete className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                                <p className="text-sm text-muted-foreground">{cert.year}</p>
                                                {cert.url && (
                                                    <a
                                                        href={cert.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        Sertifikayı Görüntüle
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
        </Formik>
    );
};

export default AdminAbout;
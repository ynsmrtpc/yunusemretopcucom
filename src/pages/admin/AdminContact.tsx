import { useEffect, useState } from "react";
import { ContactData, Message } from "@/types/admin/types.ts";
import { contactService } from "@/services/api.ts";
import { toast } from "sonner";
import { Form, Formik, FormikHelpers } from "formik";
import SubmitButton from "@/components/admin/formElements/SubmitButton";
import TextField from "@/components/admin/formElements/TextField";
import { DataTable } from "@/components/admin/tables/DataTable";
import { messageColumns } from "@/components/admin/tables/columns";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { Loader2 } from "lucide-react";

const AdminContact = () => {
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        fetchContact();
        fetchMessages();
    }, []);

    const fetchContact = async () => {
        try {
            const contact = await contactService.getAll();
            const messages = await contactService.getAllMessages();
            const response = { ...contact.data, messages: messages.data };
            setContactData(response);
        } catch (error) {
            console.error("Error fetching about:", error);
            toast.error("About verisi alınamadı.");
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await contactService.getAllMessages();
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Mesajlar alınamadı.");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await contactService.delete(id.toString());
            toast.success("Mesaj başarıyla silindi");
            fetchMessages();
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Mesaj silinemedi");
        }
    };

    const initialValues: ContactData = {
        email: contactData?.email || "",
        phone: contactData?.phone || "",
        address: contactData?.address || "",
        github_url: contactData?.github_url || "",
        linkedin_url: contactData?.linkedin_url || "",
        twitter_url: contactData?.twitter_url || "",
        instagram_url: contactData?.instagram_url || "",
    }

    const handleSubmit = async (
        values: ContactData,
        { setSubmitting }: FormikHelpers<ContactData>
    ) => {
        try {
            const result = await contactService.update(values);
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

    const columns = messageColumns(handleDelete);

    if (!contactData) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
            {
                ({ isSubmitting }) => (
                    <Form className="space-y-8">
                        <div className="flex items-center justify-between">
                            <AdminPageTitle
                                title="İletişim Bilgileri ve Gelen Mesajlar"
                                description="Sitenizin iletişim sayfasını özelleştirin"
                            />
                            <SubmitButton isSubmitting={isSubmitting} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <DataTable
                                    columns={columns}
                                    data={messages}
                                    searchKey="name"
                                    searchPlaceholder="İsme göre ara..."
                                />
                            </section>
                            <section className="space-y-8">
                                {/* İletişim Bilgileri */}
                                <div className="space-y-4">
                                    <TextField name="email" label="E-posta" required />
                                    <TextField name="phone" label="Telefon" required />
                                    <TextField name="address" label="Adres" required />
                                </div>

                                {/* Sosyal Medya */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold">Sosyal Medya</h2>
                                    <TextField name="github_url" label="Github" />
                                    <TextField name="linkedin_url" label="LinkedIn" />
                                    <TextField name="twitter_url" label="Twitter(X)" />
                                    <TextField name="instagram_url" label="Instagram" />
                                </div>
                            </section>
                        </div>

                    </Form>
                )}
        </Formik>
    );
};

export default AdminContact;

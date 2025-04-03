import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contactService } from '../services/api';
import SEO from '@/components/SEO';
import { ContactSkeleton } from '@/components/skeletons/ContactSkeleton';
import { Link } from 'react-router-dom';

interface ContactInfo {
    email: string;
    phone: string;
    address: string;
    github_url: string;
    linkedin_url: string;
    twitter_url: string;
    instagram_url: string;
}


const contactSchema = z.object({
    name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    subject: z.string().min(5, 'Konu en az 5 karakter olmalıdır'),
    message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır')
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
        resolver: zodResolver(contactSchema)
    });

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const { data } = await contactService.getAll();
                setContactInfo(data);
            } catch (err) {
                console.error('İletişim bilgileri yüklenirken hata oluştu:', err);
            } finally {
                setLoadingInfo(false);
            }
        };

        fetchContactInfo();
    }, []);

    const onSubmit = async (data: ContactForm) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await contactService.createMessage(data);
            setSuccess(true);
            reset();
        } catch (err) {
            setError('Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz:' + err);
        } finally {
            setLoading(false);
        }
    };

    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.yunusemretopcu.com';

    // Schema.org için yapısal veri
    const schemaData = {
        name: 'İletişim',
        description: 'Benimle iletişime geçin. Projeleriniz, iş teklifleriniz veya sorularınız için form doldurabilir veya doğrudan e-posta gönderebilirsiniz.',
        url: `${siteUrl}/contact`,
        contactPoint: contactInfo ? [
            {
                '@type': 'ContactPoint',
                telephone: contactInfo.phone,
                email: contactInfo.email,
                contactType: 'customer service'
            }
        ] : undefined,
        sameAs: contactInfo ? [
            contactInfo.github_url,
            contactInfo.linkedin_url,
            contactInfo.twitter_url,
            contactInfo.instagram_url
        ].filter(Boolean) : undefined,
        address: contactInfo?.address ? {
            '@type': 'PostalAddress',
            streetAddress: contactInfo.address
        } : undefined
    };

    if (loadingInfo) {
        return <ContactSkeleton />;
    }

    return (
        <>
            <SEO
                title="İletişim | Portfolio"
                description="Benimle iletişime geçin. Projeleriniz, iş teklifleriniz veya sorularınız için form doldurabilir veya doğrudan e-posta gönderebilirsiniz."
                keywords="iletişim, e-posta, telefon, adres, sosyal medya"
                canonical="/contact"
                schemaType="Organization"
                schemaData={schemaData}
            />
            <div className="container py-12">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">İletişim</h1>
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground mb-8">
                                Benimle iletişime geçmek için yandaki formu doldurabilirsiniz. En kısa sürede size dönüş yapacağım.
                            </p>
                            {!loadingInfo && contactInfo && (
                                <div className="space-y-6">
                                    {contactInfo.email && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">E-posta</h3>
                                            <Link
                                                to={`mailto:${contactInfo.email}`}
                                                className="text-muted-foreground hover:text-primary"
                                            >
                                                {contactInfo.email}
                                            </Link>
                                        </div>
                                    )}
                                    {contactInfo.phone && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Telefon</h3>
                                            <Link
                                                to={`tel:${contactInfo.phone}`}
                                                className="text-muted-foreground hover:text-primary"
                                            >
                                                {contactInfo.phone}
                                            </Link>
                                        </div>
                                    )}
                                    {contactInfo.address && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Adres</h3>
                                            <p className="text-muted-foreground">
                                                {contactInfo.address}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Sosyal Medya</h3>
                                        <div className="flex gap-4">
                                            {contactInfo.linkedin_url && (
                                                <a
                                                    href={contactInfo.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    LinkedIn
                                                </a>
                                            )}
                                            {contactInfo.github_url && (
                                                <a
                                                    href={contactInfo.github_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    GitHub
                                                </a>
                                            )}
                                            {contactInfo.twitter_url && (
                                                <a
                                                    href={contactInfo.twitter_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    Twitter
                                                </a>
                                            )}
                                            {contactInfo.instagram_url && (
                                                <a
                                                    href={contactInfo.instagram_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    Instagram
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Adınız"
                                    {...register('name')}
                                    className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {errors.name && (
                                    <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="E-posta Adresiniz"
                                    {...register('email')}
                                    className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {errors.email && (
                                    <p className="text-red-500 mt-1 text-sm">{errors.email.message}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Konu"
                                    {...register('subject')}
                                    className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {errors.subject && (
                                    <p className="text-red-500 mt-1 text-sm">{errors.subject.message}</p>
                                )}
                            </div>
                            <div>
                                <textarea
                                    placeholder="Mesajınız"
                                    {...register('message')}
                                    rows={6}
                                    className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                />
                                {errors.message && (
                                    <p className="text-red-500 mt-1 text-sm">{errors.message.message}</p>
                                )}
                            </div>
                            {error && (
                                <p className="text-red-500">{error}</p>
                            )}
                            {success && (
                                <p className="text-green-500">Mesajınız başarıyla gönderildi. Teşekkür ederiz!</p>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                            >
                                {loading ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact; 
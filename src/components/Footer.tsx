import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { footerService } from "../services/api.ts";
import { createIcons, icons } from 'lucide';

interface FooterData {
    logo?: string;
    description?: string;
    copyright_text: string;
    navigation_links: {
        id: number;
        title: string;
        url: string;
    }[];
    social_links: {
        id: number;
        platform: string;
        url: string;
        icon: string;
    }[];
}

const Footer = () => {
    const [data, setData] = useState<FooterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const { data } = await footerService.get();
                setData(data);
                setLoading(false);
            } catch (err) {
                setError('Footer içeriği yüklenirken bir hata oluştu:' + err);
                setLoading(false);
            }
        };

        fetchFooterData();
    }, []);

    // İkonları sayfa yüklendiğinde mount et
    useEffect(() => {
        createIcons({ icons });
    }, [data]); // Data değiştiğinde ikonları yeniden oluştur

    if (loading) {
        return (
            <footer className="bg-background border-t">
                <div className="container py-8">
                    <p>Yükleniyor...</p>
                </div>
            </footer>
        );
    }

    if (error || !data) {
        return (
            <footer className="bg-background border-t">
                <div className="container py-8">
                    <p className="text-red-500">{error || 'Footer içeriği bulunamadı.'}</p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-background border-t">
            <div className="container py-12">
                <div className="grid gap-8 md:grid-cols-3">
                    <div>
                        {data.logo && (
                            <img
                                src={data.logo}
                                alt="Logo"
                                className="h-8 mb-4"
                            />
                        )}
                        {data.description && (
                            <p className="text-muted-foreground">
                                {data.description}
                            </p>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h3>
                        <nav className="flex flex-col space-y-2">
                            {data.navigation_links.map((link) => (
                                <Link
                                    key={link.id}
                                    to={link.url}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
                        <div className="flex space-x-4">
                            {data.social_links && data.social_links.map((link) => (
                                <Link
                                    title={link.platform}
                                    key={link.id}
                                    to={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <i data-lucide={link.icon}></i>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
                    <p>{data.copyright_text}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../services/api';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageGallery from '@/components/ImageGallery';
import SEO from '@/components/SEO';
import { PortfolioDetailSkeleton } from '@/components/skeletons/PortfolioDetailSkeleton';
import { ImGithub } from 'react-icons/im';
import { Link } from 'react-router-dom';
import { CgMediaLive } from "react-icons/cg";

interface Project {
    id: number;
    title: string;
    description: string;
    content: string;
    image?: string;
    coverImage?: string;
    galleryImages?: string[];
    technologies: string[];
    github_url: string;
    live_url: string;
    slug?: string;
}

const PortfolioDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                if (!id) throw new Error('Proje ID bulunamadı');
                const { data } = await projectService.getById(id);
                setProject(data);
            } catch (err: any) {
                setError('Proje detayları yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return <PortfolioDetailSkeleton />;
    }

    if (error || !project) {
        return (
            <div className="container py-12 text-center">
                <p className="text-red-500">{error || "Proje bulunamadı."}</p>
            </div>
        );
    }

    // HTML içeriğinden metin çıkarma (SEO açıklaması için)
    const getTextFromHtml = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const description = project.description || getTextFromHtml(project.content).substring(0, 160);
    const keywords = project.technologies.join(', ');
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.siteadresi.com';
    const projectUrl = `${siteUrl}/portfolio/${project.slug || id}`;
    const projectImage = project.coverImage || project.image;

    // Schema.org için yapısal veri
    const schemaData = {
        name: project.title,
        description: description,
        image: projectImage,
        url: projectUrl,
        offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            price: '0',
            priceCurrency: 'USD'
        },
        brand: {
            '@type': 'Brand',
            name: 'Portfolio'
        },
        additionalProperty: project.technologies.map(tech => ({
            '@type': 'PropertyValue',
            name: 'technology',
            value: tech
        }))
    };

    return (
        <>
            <SEO
                title={`${project.title} | Portfolio`}
                description={description}
                keywords={keywords}
                ogImage={projectImage}
                canonical={`/portfolio/${project.slug || id}`}
                schemaType="Product"
                schemaData={schemaData}
            />
            <div className="container py-12 px-4">
                <article className="max-w-4xl mx-auto space-y-8">
                    {(project.coverImage || project.image) && (
                        <img
                            src={project.coverImage || project.image}
                            alt={project.title}
                            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                        />
                    )}
                    <div className="flex justify-between items-center space-y-4">
                        <div className="space-x-1">
                            {project.technologies.map((tech, idx) => (
                                <span
                                    key={idx}
                                    className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm font-medium"
                                >
                                    {tech.trim()}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-center gap-2">
                            {project.github_url && (
                                <Button asChild variant="outline">
                                    <Link
                                        to={project.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='flex items-center gap-1'
                                    >
                                        <ImGithub />
                                        <span>GitHub</span>
                                    </Link>
                                </Button>
                            )}
                            {project.live_url && (
                                <Button asChild variant="outline">
                                    <a
                                        href={project.live_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='flex items-center gap-1'
                                    >
                                        <CgMediaLive />
                                        <span>Canlı Demo</span>
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                    <Card className="border-0 shadow-none">
                        <CardContent>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: project.content }}
                            />
                        </CardContent>
                    </Card>

                    {/* Galeri Bölümü */}
                    {project.galleryImages && project.galleryImages.length > 0 && (
                        <ImageGallery
                            images={project.galleryImages}
                            title="Proje Görselleri"
                        />
                    )}
                </article>
            </div>
        </>
    );
};

export default PortfolioDetail;

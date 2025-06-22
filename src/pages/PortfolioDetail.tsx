import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../services/api';

import { Button } from '@/components/ui/button';
import ImageGallery from '@/components/ImageGallery';
import SEO from '@/components/SEO';
import { PortfolioDetailSkeleton } from '@/components/skeletons/PortfolioDetailSkeleton';
import { Link } from 'react-router-dom';
import { CgMediaLive } from "react-icons/cg";
import { ProjectPost } from "@/types/admin/types.ts";
import { FaGithub } from 'react-icons/fa';
import { Eye } from 'lucide-react';

const PortfolioDetail = () => {
    const { id: slug } = useParams<{ id: string }>();
    const [project, setProject] = useState<ProjectPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjectAndIncrementView = async () => {
            if (!slug) return;
            setLoading(true);
            setError(null);
            try {
                // Proje verisini çek
                const response = await projectService.getById(slug);
                response.data.technologies = JSON.parse(response.data.technologies);
                setProject(response.data);

                // Görüntüleme sayısını artır (arka planda)
                projectService.incrementView(slug)
                    .then(() => console.log(`[PortfolioDetail] View count increment request sent for ${slug}`))
                    .catch(viewError => console.error("[PortfolioDetail] Failed to increment view count:", viewError));

            } catch (err) {
                console.error("Error fetching project details:", err);
                setError("Proje detayları yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectAndIncrementView();
    }, [slug]);

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
    const keywords = project.technologies.join(', ');
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.yunusemretopcu.com';
    const projectUrl = `${siteUrl}/portfolio/${project.slug || slug}`;
    const projectImage = project.coverImage;

    // Schema.org için yapısal veri
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": project.title,
        "description": project.description,
        "image": projectImage ? `${siteUrl}${projectImage}` : undefined,
        "url": projectUrl,
        "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock",
            "price": "0",
            "priceCurrency": "USD"
        },
        "brand": {
            "@type": "Brand",
            "name": "Portfolio"
        },
        "additionalProperty": project.technologies.map((tech) => ({
            "@type": "PropertyValue",
            "name": "technology",
            "value": tech
        }))
    };

    return (
        <div className="container mt-16 lg:mt-32">
            <SEO
                title={`${project.title} | Portfolio`}
                description={project.description}
                keywords={keywords}
                ogImage={projectImage}
                canonical={`/portfolio/${project.slug || slug}`}
                schemaType="Product"
                schemaData={schemaData}
            />
            <div className="xl:relative">
                <div className="mx-auto max-w-2xl lg:max-w-5xl">
                    <header className="flex flex-col">
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                            {project.title}
                        </h1>
                        <div className="order-first flex items-center justify-between text-base text-zinc-400 dark:text-zinc-500">
                            <time
                                dateTime={project.created_at ? new Date(project.created_at).toISOString() : undefined}
                                className="flex items-center"
                            >
                                <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                                <span className="ml-3">{project.year}</span>
                            </time>
                            {project.views !== undefined && (
                                <span className="flex items-center">
                                    <Eye className="mr-1 h-4 w-4" />
                                    {project.views}
                                </span>
                            )}
                        </div>
                    </header>
                    <article className="mt-16 lg:mt-20">
                        {project.content && (
                            <div
                                className="prose dark:prose-invert prose-lg"
                                dangerouslySetInnerHTML={{ __html: project.content }}
                            />
                        )}
                        {project.galleryImages && project.galleryImages.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl mb-6">Galeri</h2>
                                <ImageGallery images={project.galleryImages} />
                            </div>
                        )}
                        <div className="mt-12 flex flex-wrap gap-4">
                            {project.live_url && (
                                <Button asChild variant="secondary">
                                    <Link to={project.live_url} target="_blank" rel="noopener noreferrer">
                                        <CgMediaLive className="mr-2 h-5 w-5" /> Canlı Demo
                                    </Link>
                                </Button>
                            )}
                            {project.github_url && (
                                <Button asChild variant="outline">
                                    <Link to={project.github_url} target="_blank" rel="noopener noreferrer">
                                        <FaGithub className="mr-2 h-5 w-5" /> GitHub
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
};

export default PortfolioDetail;

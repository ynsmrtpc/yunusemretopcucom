import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { homeService } from '../services/api';
import api from '../services/api';
import SEO from '@/components/SEO';
import { HomeSkeleton } from '@/components/skeletons/HomeSkeleton';

interface Service {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface Blog {
    id: number;
    title: string;
    description: string;
    image?: string;
    coverImage?: string;
    slug: string;
}

interface Project {
    id: number;
    title: string;
    description: string;
    image?: string;
    coverImage?: string;
    technologies: string[];
    slug: string;
}

interface HomeData {
    hero_title: string;
    hero_subtitle: string;
    hero_image: string | null;
    about_section_title: string;
    about_section_content: string;
    about_section_image: string | null;
    services_section_title: string;
    services: Service[];
}

export const Home = () => {
    const [data, setData] = useState<HomeData | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState({
        home: true,
        blogs: true,
        projects: true
    });
    const [error, setError] = useState<{
        home: string | null;
        blogs: string | null;
        projects: string | null;
    }>({
        home: null,
        blogs: null,
        projects: null
    });

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const { data } = await homeService.get();
                setData(data);
                setLoading(prev => ({ ...prev, home: false }));
            } catch (err) {
                setError(prev => ({ ...prev, home: 'Sayfa içeriği yüklenirken bir hata oluştu:' + err }));
                setLoading(prev => ({ ...prev, home: false }));
            }
        };

        fetchHomeData();
    }, []);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data: { blogs: blogData } } = await api.get('/blogs', { params: { limit: 3 } });
                setBlogs(blogData);
                setLoading(prev => ({ ...prev, blogs: false }));
            } catch (err: any) {
                setError(prev => ({ ...prev, blogs: 'Blog yazıları yüklenirken bir hata oluştu: ' + err }));
                setLoading(prev => ({ ...prev, blogs: false }));
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data: { projects: projectData } } = await api.get('/projects', { params: { limit: 3 } });
                setProjects(projectData);
                setLoading(prev => ({ ...prev, projects: false }));
            } catch (err: any) {
                setError(prev => ({ ...prev, projects: 'Projeler yüklenirken bir hata oluştu: ' + err }));
                setLoading(prev => ({ ...prev, projects: false }));
            }
        };
        fetchProjects();
    }, []);

    if (loading.home || loading.blogs || loading.projects) {
        return <HomeSkeleton />;
    }

    if (!data) {
        return (
            <div className="container py-12">
                <p className="text-red-500">Sayfa içeriği bulunamadı.</p>
            </div>
        );
    }

    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.yunusemretopcu.com';

    // Schema.org için yapısal veri
    const schemaData = {
        name: 'Portfolio',
        alternateName: 'Kişisel Web Sitesi',
        url: siteUrl,
        description: data.hero_subtitle,
        potentialAction: [
            {
                '@type': 'SearchAction',
                'target': `${siteUrl}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
            }
        ]
    };

    return (
        <>
            <SEO
                title="Ana Sayfa | Portfolio"
                description={data.hero_subtitle || "Yunus Emre Topçu"}
                keywords="portfolio, web geliştirme, projeler"
                ogImage={data.hero_image || undefined}
                canonical="/"
                schemaType="WebSite"
                schemaData={schemaData}
            />
            <div>
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                    {data.hero_image && (
                        <div className="absolute inset-0 z-0">
                            <img
                                src={data.hero_image}
                                alt="Hero Background"
                                className="w-full h-full object-cover opacity-10"
                            />
                        </div>
                    )}
                    <div className="container relative">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {data.hero_title}
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                {data.hero_subtitle}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link to="/portfolio">
                                    <Button size="lg" className="rounded-full">
                                        Projelerimi Görüntüle
                                    </Button>
                                </Link>
                                <Link to="/contact">
                                    <Button size="lg" variant="outline" className="rounded-full">
                                        İletişime Geç
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-20">
                    <div className="container">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {data.about_section_image && (
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src={data.about_section_image}
                                        alt="About Me"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h2 className="text-3xl font-bold mb-6">{data.about_section_title}</h2>
                                <div className="prose prose-lg max-w-none">
                                    <p>{data.about_section_content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container">
                        <h2 className="text-3xl font-bold text-center mb-12">{data.services_section_title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {data.services.map((service) => (
                                <div key={service.id} className="bg-background p-8 rounded-lg border hover:border-primary transition-colors">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                                        <span className="material-icons">
                                            {service.icon}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                                    <p className="text-muted-foreground">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Projects */}
                <section className="py-20">
                    <div className="container">
                        <h2 className="text-3xl font-bold text-center mb-12">Öne Çıkan Projeler</h2>
                        {error.projects && (
                            <p className="text-red-500 text-center mb-8">{error.projects}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {projects.map((project) => (
                                <div key={project.id} className="group relative overflow-hidden rounded-lg border bg-background flex flex-col justify-between">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={project.coverImage || project.image || '/placeholder-image.jpg'}
                                            alt={project.title}
                                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6 flex-1">
                                        <h3 className="text-center text-xl font-bold mb-2">{project.title}</h3>
                                    </div>
                                    <div className="p-6 pt-0">
                                        <Link to={`/portfolio/${project.slug}`}>
                                            <Button variant="outline" className="w-full rounded-full">
                                                Detayları Görüntüle
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link to="/portfolio">
                                <Button variant="outline" size="lg" className="rounded-full">
                                    Tüm Projeleri Görüntüle
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Latest Blog Posts */}
                <section className="py-20 bg-muted/30">
                    <div className="container">
                        <h2 className="text-3xl font-bold text-center mb-12">Son Blog Yazıları</h2>
                        {error.blogs && (
                            <p className="text-red-500 text-center mb-8">{error.blogs}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <div key={blog.id} className="bg-background rounded-lg border hover:border-primary transition-colors overflow-hidden">
                                    <div className="aspect-video">
                                        <img
                                            src={blog.coverImage || blog.image || '/placeholder-image.jpg'}
                                            alt={blog.title}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                                        <p className="text-muted-foreground mb-4">{blog.description}</p>
                                        <Link to={`/blog/${blog.slug}`}>
                                            <Button variant="outline" className="w-full rounded-full">
                                                Devamını Oku
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link to="/blog">
                                <Button variant="outline" size="lg" className="rounded-full">
                                    Tüm Yazıları Görüntüle
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-20">
                    <div className="container">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-4">Projeniz mi var?</h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Projenizi birlikte hayata geçirelim. Hemen iletişime geçin!
                            </p>
                            <Link to="/contact">
                                <Button size="lg" className="rounded-full">
                                    İletişime Geç
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Home;
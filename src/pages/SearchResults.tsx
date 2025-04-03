import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api'; // api instance'ını import et
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { BlogList as BlogPost } from '@/types/admin/types';
import { ProjectList as Project } from '@/types/admin/types';

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [blogResults, setBlogResults] = useState<BlogPost[]>([]);
    const [projectResults, setProjectResults] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Paralel istekler
                const [blogResponse, projectResponse] = await Promise.all([
                    api.get('/blogs', { params: { q: query } }),
                    api.get('/projects', { params: { q: query } })
                ]);
                setBlogResults(blogResponse.data);
                setProjectResults(projectResponse.data);
            } catch (err: any) {
                console.error("Arama sonuçları alınırken hata:", err);
                setError('Arama sonuçları yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) {
        return (
            <div className="container py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-12 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const hasResults = blogResults.length > 0 || projectResults.length > 0;

    return (
        <>
            <SEO
                title={`Arama Sonuçları: ${query}`}
                description={`"${query}" için arama sonuçları.`}
                noindex={true} // Arama sonuçları genellikle indexlenmez
            />
            <div className="container py-12">
                <h1 className="text-3xl font-bold mb-8">
                    Arama Sonuçları: "{query}"
                </h1>

                {!hasResults ? (
                    <p className="text-center text-muted-foreground">Arama kriterlerinize uygun sonuç bulunamadı.</p>
                ) : (
                    <div className="space-y-12">
                        {/* Blog Sonuçları */}
                        {blogResults.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Blog Yazıları ({blogResults.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blogResults.map((blog) => (
                                        <Card key={`blog-${blog.id}`} className="flex flex-col">
                                            {/* Blog kart içeriği BlogList.tsx'ten alınabilir */}
                                            <CardHeader>
                                                <CardTitle>{blog.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className='flex-grow'>
                                                <p className="text-sm text-muted-foreground line-clamp-3">{blog.excerpt || blog.content}</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button asChild variant="link" className="p-0">
                                                    <Link to={`/blog/${blog.slug}`}>Devamını Oku</Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Proje Sonuçları */}
                        {projectResults.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Projeler ({projectResults.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projectResults.map((project) => {
                                        const coverImageUrl = project.images && project.images.length > 0 ? project.images[0] : undefined;
                                        return (
                                            <Card key={`project-${project.id}`} className="flex flex-col">
                                                {/* Proje kart içeriği Portfolio.tsx'ten alınabilir */}
                                                {coverImageUrl && (
                                                    <img src={coverImageUrl} alt={project.title} className="w-full h-40 object-cover rounded-t-lg" />
                                                )}
                                                <CardHeader>
                                                    <CardTitle>{project.title}</CardTitle>
                                                    <CardDescription>{project.category} • {project.year}</CardDescription>
                                                </CardHeader>
                                                <CardContent className='flex-grow'>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button asChild variant="link" className="p-0">
                                                        <Link to={`/portfolio/${project.slug}`}>Detaylar</Link>
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default SearchResults;

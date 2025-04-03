import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { BlogSkeleton } from '@/components/skeletons/BlogSkeleton';
import { BlogList as BlogPost } from '@/types/admin/types';
import { AdminPageTitle } from '@/components/admin/AdminPageTitle';

const BlogList = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBlogs(currentPage);
    }, [currentPage]);

    const fetchBlogs = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: page };
            const { data } = await api.get('/blogs', { params });
            setBlogs(data.blogs);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err: any) {
            setError('Blog yazıları yüklenirken bir hata oluştu: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && blogs.length === 0) {
        return <BlogSkeleton />;
    }

    if (error) {
        return (
            <div className="container py-12 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Blog | Portfolio"
                description="Yazılım, tasarım ve teknoloji hakkında blog yazıları"
                keywords="blog, yazılım, web geliştirme, teknoloji"
                canonical="/blog"
            />
            <div className="container py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* <h1 className="text-4xl font-bold mb-12">Blog Yazıları</h1>*/}

                    <div className="mb-12">
                        <AdminPageTitle
                            title="Blog Yazıları"
                            description="Tüm blog yazılarıma buradan erişebilirsiniz"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        {blogs.map((blog) => (
                            <Card key={blog.id} className="hover:shadow-xl transition-shadow flex flex-col justify-between">
                                {(blog.coverImage || blog.image) && (
                                    <img
                                        src={blog.coverImage || blog.image}
                                        alt={blog.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <CardHeader>
                                    <CardTitle className="text-xl">{blog.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="">
                                    <p className="text-gray-700 mb-4">
                                        {blog.excerpt ? blog.excerpt.substring(0, 150) + '...' : ''}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between">
                                    <time className="text-sm text-gray-500">
                                        {new Date(blog.created_at).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </time>
                                    <Link to={`/blog/${blog.slug}`}>
                                        <Button variant="default" size="sm">
                                            Devamını Oku
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || loading}
                            >
                                Önceki
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Sayfa {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages || loading}
                            >
                                Sonraki
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BlogList;

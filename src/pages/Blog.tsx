import { useEffect, useState } from 'react';
import { blogService } from '../services/api';
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

interface Blog {
    id: number;
    title: string;
    content: string;
    image?: string; // blog resmi varsa
    coverImage?: string; // yeni alan
    created_at: string;
    excerpt: string;
    slug: string;
}

const BlogList = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await blogService.getAll();

                setBlogs(data);
            } catch (err: any) {
                setError('Blog yazıları yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
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
                    <h1 className="text-4xl font-bold text-center mb-12">Blog Yazıları</h1>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {blogs.map((blog) => (
                            <Card key={blog.id} className="hover:shadow-xl transition-shadow">
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
                                <CardContent className="p-4">
                                    <p className="text-gray-700 mb-4">
                                        {blog.excerpt.substring(0, 150)}...
                                    </p>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between p-4">
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
                </div>
            </div>
        </>
    );
};

export default BlogList;

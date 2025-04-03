import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogService } from '../services/api';
import {
    Card,
    CardHeader,
    CardContent,
} from '@/components/ui/card';
import ImageGallery from '@/components/ImageGallery';
import { Eye } from 'lucide-react';
import SEO from '@/components/SEO';
import { BlogDetailSkeleton } from '@/components/skeletons/BlogDetailSkeleton';

interface Blog {
    id: number;
    title: string;
    content: string;
    image?: string;
    coverImage?: string;
    galleryImages?: string[];
    created_at: string;
    excerpt?: string;
    slug?: string;
    views?: number;
}

const BlogDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlogAndIncrementView = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const { data } = await blogService.getById(id);
                setBlog(data);

                blogService.incrementView(id)
                    .then(() => console.log(`[BlogDetail] View count increment request sent for ${id}`))
                    .catch(viewError => console.error("[BlogDetail] Failed to increment view count:", viewError));

            } catch (err: any) {
                console.error("Error fetching blog details:", err);
                setError('Blog yazısı yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogAndIncrementView();
    }, [id]);

    if (loading) {
        return <BlogDetailSkeleton />;
    }

    if (error || !blog) {
        return (
            <div className="container py-12 text-center">
                <p className="text-red-500">{error || 'Blog yazısı bulunamadı.'}</p>
            </div>
        );
    }

    // HTML içeriğinden metin çıkarma (SEO açıklaması için)
    const getTextFromHtml = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const description = blog.excerpt || getTextFromHtml(blog.content).substring(0, 160);
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.yunusemretopcu.com';
    const blogUrl = `${siteUrl}/blog/${blog.slug || id}`;
    const blogImage = blog.coverImage || blog.image;

    // Schema.org için yapısal veri
    const schemaData = {
        headline: blog.title,
        description: description,
        image: blogImage,
        datePublished: blog.created_at,
        dateModified: blog.created_at,
        author: {
            '@type': 'Person',
            name: 'Site Sahibi',
            url: `${siteUrl}/about`
        },
        publisher: {
            '@type': 'Organization',
            name: 'Portfolio',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/logo.png`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': blogUrl
        }
    };

    return (
        <>
            <SEO
                title={`${blog.title} | Blog`}
                description={description}
                keywords="blog, yazılım, web geliştirme, teknoloji"
                ogImage={blogImage}
                canonical={`/blog/${blog.slug || id}`}
                schemaType="BlogPosting"
                schemaData={schemaData}
            />
            <div className="container py-12 px-4">
                <article className="max-w-4xl mx-auto space-y-2">
                    {(blog.coverImage || blog.image) && (
                        <img
                            src={blog.coverImage || blog.image}
                            alt={blog.title}
                            className="w-full max-h-full rounded-lg shadow-lg"
                        />
                    )}
                    {/* <div className="space-y-4">
                        <h1 className="text-4xl font-bold">{blog.title}</h1>
                        <time className="text-sm text-gray-500 block">
                            {new Date(blog.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                    </div> */}

                    <Card className="border-0 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <time dateTime={blog.created_at ? new Date(blog.created_at).toISOString() : undefined}>
                                    {new Date(blog.created_at).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </time>
                                {blog.views !== undefined && (
                                    <span className="flex items-center">
                                        <Eye className="mr-1 h-4 w-4" />
                                        {blog.views}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: blog.content.replace("<br>", "") }}
                            />
                        </CardContent>
                    </Card>

                    {/* Galeri Bölümü */}
                    {blog.galleryImages && blog.galleryImages.length > 0 && (
                        <ImageGallery
                            images={blog.galleryImages}
                            title="Galeri"
                        />
                    )}
                </article>
            </div>
        </>
    );
};

export default BlogDetail;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogService } from '../services/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import ImageGallery from '@/components/ImageGallery';
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
}

const BlogDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                if (!id) throw new Error('Blog ID bulunamadı');
                const { data } = await blogService.getById(id);
                //  data.image = "https://images.pexels.com/photos/30146008/pexels-photo-30146008.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
                setBlog(data);
            } catch (err: any) {
                setError('Blog yazısı yüklenirken bir hata oluştu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
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
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.siteadresi.com';
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
                            <time className="text-sm text-gray-500 block">
                                {new Date(blog.created_at).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
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

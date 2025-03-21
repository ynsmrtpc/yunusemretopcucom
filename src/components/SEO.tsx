import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    noindex?: boolean;
    canonical?: string;
    schemaType?: 'WebSite' | 'Article' | 'BlogPosting' | 'Person' | 'Organization' | 'Product';
    schemaData?: Record<string, any>;
}

export const SEO = ({
    title,
    description,
    keywords,
    ogImage,
    noindex = false,
    canonical,
    schemaType,
    schemaData,
}: SEOProps) => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.siteadresi.com';
    const defaultOgImage = `${siteUrl}/og-image.jpg`;

    // Temel schema.org yapılandırması
    const baseSchema = {
        '@context': 'https://schema.org',
        '@type': schemaType || 'WebSite',
        url: canonical ? `${siteUrl}${canonical}` : siteUrl,
        ...schemaData,
    };

    // Sayfa türüne göre schema.org verisi oluşturma
    const generateSchema = () => {
        if (!schemaType) return baseSchema;

        switch (schemaType) {
            case 'Article':
            case 'BlogPosting':
                return {
                    ...baseSchema,
                    headline: title,
                    description: description,
                    image: ogImage || defaultOgImage,
                    ...schemaData,
                };
            case 'Person':
                return {
                    ...baseSchema,
                    name: schemaData?.name || title,
                    ...schemaData,
                };
            case 'Organization':
                return {
                    ...baseSchema,
                    name: schemaData?.name || title,
                    logo: schemaData?.logo || `${siteUrl}/logo.png`,
                    ...schemaData,
                };
            case 'Product':
                return {
                    ...baseSchema,
                    name: schemaData?.name || title,
                    description: description,
                    image: ogImage || defaultOgImage,
                    ...schemaData,
                };
            default:
                return baseSchema;
        }
    };

    const schemaJson = generateSchema();

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical ? `${siteUrl}${canonical}` : siteUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage || defaultOgImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical ? `${siteUrl}${canonical}` : siteUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage || defaultOgImage} />

            {/* Robots */}
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow" />
            )}

            {/* Schema.org yapısal veri */}
            <script type="application/ld+json">
                {JSON.stringify(schemaJson)}
            </script>
        </Helmet>
    );
};

export default SEO; 
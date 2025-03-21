import { Router, Request, Response } from 'express';
import { getDB } from '../config/db.js';
import { RowDataPacket } from 'mysql2';
import { SitemapStream } from 'sitemap';
import { Readable } from 'stream';

const router = Router();

// Sitemap önbelleği - performans için
let sitemap: string | null = null;
let lastUpdated = 0;

// Sitemap için link tipi
interface SitemapLink {
    url: string;
    changefreq: string;
    priority: number;
    lastmod?: string;
}

// Sitemap oluşturma ve önbellekleme
router.get('/', async (req: Request, res: Response) => {
    try {
        const now = Date.now();
        
        // Eğer önbellekte sitemap varsa ve 1 saatten daha yeni oluşturulmuşsa onu kullan
        if (sitemap && now - lastUpdated < 3600000) {
            res.header('Content-Type', 'application/xml');
            return res.send(sitemap);
        }
        
        // Ana sayfalar için statik linkler
        const staticLinks: SitemapLink[] = [
            { url: '/', changefreq: 'daily', priority: 1.0 },
            { url: '/about', changefreq: 'monthly', priority: 0.7 },
            { url: '/contact', changefreq: 'monthly', priority: 0.7 },
            { url: '/blog', changefreq: 'weekly', priority: 0.8 },
            { url: '/portfolio', changefreq: 'weekly', priority: 0.8 },
        ];

        // Blogları veritabanından al
        const [blogRows] = await getDB().execute<RowDataPacket[]>(
            'SELECT slug, updated_at, created_at FROM blogs WHERE status = "published" ORDER BY created_at DESC'
        );

        // Projeler veritabanından al
        const [projectRows] = await getDB().execute<RowDataPacket[]>(
            'SELECT slug, updated_at, created_at FROM projects WHERE status = "published" ORDER BY created_at DESC'
        );

        // Tüm URL linklerini bir araya getir
        const links: SitemapLink[] = [...staticLinks];

        // Blog sayfalarını ekle
        for (const blog of blogRows) {
            links.push({
                url: `/blog/${blog.slug}`,
                changefreq: 'monthly',
                priority: 0.6,
                lastmod: new Date(blog.updated_at || blog.created_at).toISOString().split('T')[0]
            });
        }

        // Proje sayfalarını ekle
        for (const project of projectRows) {
            links.push({
                url: `/portfolio/${project.slug}`,
                changefreq: 'monthly',
                priority: 0.6,
                lastmod: new Date(project.updated_at || project.created_at).toISOString().split('T')[0]
            });
        }

        // Sitemap oluştur
        const stream = new SitemapStream({ hostname: 'https://www.yunusemretopcu.com' });
        
        // String birleştirme için
        let xml = '';
        
        // Stream olaylarını dinle
        stream.on('data', chunk => {
            xml += chunk.toString();
        });

        // Stream tamamlandığında
        const streamEnd = new Promise<string>((resolve, reject) => {
            stream.on('end', () => resolve(xml));
            stream.on('error', reject);
        });

        // Linkleri stream'e yaz
        for (const link of links) {
            stream.write(link);
        }
        
        // Stream'i kapat
        stream.end();
        
        // Stream'in tamamlanmasını bekle
        sitemap = await streamEnd;
        lastUpdated = now;

        // XML yanıt olarak gönder
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap oluşturma hatası:', error);
        res.status(500).send('Sitemap oluşturulurken bir hata oluştu');
    }
});

export default router; 
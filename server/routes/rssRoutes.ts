import { Router, Request, Response } from 'express';
import { getDB } from '../config/db.js';
import { RowDataPacket } from 'mysql2';
import RSS from 'rss';

const router = Router();

// RSS önbelleği - performans için
let rssXml: string | null = null;
let lastUpdated = 0;

router.get('/', async (req: Request, res: Response) => {
    try {
        const now = Date.now();
        
        // Eğer önbellekte RSS varsa ve 1 saatten daha yeni oluşturulmuşsa onu kullan
        if (rssXml && now - lastUpdated < 3600000) {
            res.header('Content-Type', 'application/xml');
            return res.send(rssXml);
        }
        
        // RSS feed meta bilgileri
        const feed = new RSS({
            title: 'Yunus Emre Topçu Blog',
            description: 'Web geliştirme, yazılım teknolojileri ve proje deneyimleri hakkında blog yazıları',
            site_url: 'https://www.yunusemretopcu.com',
            feed_url: 'https://www.yunusemretopcu.com/rss',
            image_url: 'https://www.yunusemretopcu.com/logo.png',
            language: 'tr',
            pubDate: new Date(),
            ttl: 60 // 60 dakika için geçerli
        });
        
        // Blogları veritabanından al - sadece yayınlanmış olanlar
        const [blogRows] = await getDB().execute<RowDataPacket[]>(
            'SELECT b.id, b.title, b.slug, b.excerpt, b.created_at, b.updated_at ' +
            'FROM blogs b ' +
            'WHERE b.status = "published" ' +
            'ORDER BY b.created_at DESC'
        );
        
        // Her blog için kapak resmini al
        for (const blog of blogRows) {
            const [imageRows] = await getDB().execute<RowDataPacket[]>(
                'SELECT image_url FROM blog_images WHERE blog_id = ? AND type = "cover" LIMIT 1',
                [blog.id]
            );
            
            const coverImage = imageRows.length > 0 ? imageRows[0].image_url : null;
            
            // RSS feed'e ekle
            feed.item({
                title: blog.title,
                description: blog.excerpt,
                url: `https://www.yunusemretopcu.com/blog/${blog.slug}`,
                guid: `blog-${blog.id}`,
                categories: [], // Eğer kategori sisteminiz varsa ekleyebilirsiniz
                author: 'Yunus Emre Topçu', // Veritabanından yazarı alabilirsiniz
                date: new Date(blog.created_at),
                enclosure: coverImage ? {
                    url: `https://www.yunusemretopcu.com${coverImage}`,
                    type: 'image/jpeg' // Resim türünü belirleyin
                } : undefined
            });
        }
        
        // RSS XML oluştur
        rssXml = feed.xml({ indent: true });
        lastUpdated = now;
        
        // XML yanıt olarak gönder
        res.header('Content-Type', 'application/xml');
        res.send(rssXml);
    } catch (error) {
        console.error('RSS oluşturma hatası:', error);
        res.status(500).send('RSS feed oluşturulurken bir hata oluştu');
    }
});

export default router; 
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    // Robots.txt içeriğini oluştur
    const robotsTxt = `# Portfolio Website Robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login
Disallow: /register

# Sitemap
Sitemap: https://www.yunusemretopcu.com/sitemap.xml

# RSS Feed
Sitemap: https://www.yunusemretopcu.com/rss
`;

    // Text olarak gönder
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
});

export default router; 
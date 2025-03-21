import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import blogRoutes from './routes/blogRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import navbarRoutes from './routes/navbarRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import sitemapRoutes from './routes/sitemapRoutes';
import rssRoutes from './routes/rssRoutes';
import robotsRoutes from './routes/robotsRoutes';
import { initializeDB, getDB } from './config/db.js';
import uploadRoutes from './routes/upload';
import fs from 'fs';
import { RowDataPacket } from 'mysql2';

// ES modüllerde __dirname oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin:[
        'https://yunusemretopcu.com',
        'http://localhost:5173',
        'http://localhost:5000',
        // buraya kendi url'lerinizi eklemelisiniz
         ],
    credentials: true
}));

app.use(express.json({ limit: '10mb' })); // JSON istek boyutunu artır
app.use(cookieParser());

// Statik dosyaları servis et
app.use(express.static(path.join(__dirname, '../public')));

// Route'ları tanımla
app.use('/api/blogs', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/navbar', navbarRoutes);
app.use('/api/meta-settings', metaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// SEO Route'ları
app.use('/sitemap.xml', sitemapRoutes);
app.use('/rss', rssRoutes);
app.use('/robots.txt', robotsRoutes);

// Meta veri middleware'i - HTML içeriğini veritabanından alınan meta bilgileriyle değiştirir
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.url.indexOf('.') !== -1 || 
      req.url.startsWith('/api') || 
      req.url.startsWith('/uploads')) {
    return next();
  }
  
  try {
    const db = getDB();
    const [metaSettings] = await db.execute<RowDataPacket[]>('SELECT * FROM meta_settings LIMIT 1');
    
    if (metaSettings.length === 0) {
      return next();
    }
    
    const meta = metaSettings[0];
    const siteUrl = process.env.SITE_URL || 'http://localhost:5000';
    
    // URL'den içerik türünü ve ID'yi belirle
    let contentTitle = meta.site_title;
    let contentDescription = meta.site_description;
    let contentImage = meta.favicon ? `${siteUrl}${meta.favicon}` : `${siteUrl}/og-image.jpg`;
    // Blog detay sayfası mı kontrol et
    const blogMatch = req.url.match(/\/blog\/([^\/]+)$/);
    if (blogMatch && blogMatch[1]) {
      const blogId = blogMatch[1];

      try {
        const [blogData] = await db.execute<RowDataPacket[]>(
          `SELECT b.title, b.excerpt, bi.image_url FROM blogs b LEFT JOIN blog_images bi on bi.blog_id = b.id WHERE b.slug = ? and bi.type=?`, 
          [blogId, "cover"]
        );

        if (blogData.length > 0) {
          const blog = blogData[0];
          contentTitle = `${blog.title} | ${meta.site_title}`;
          contentDescription = blog.excerpt || meta.site_description;
          contentImage = blog.image_url 
            ? `${siteUrl}${blog.image_url}`
            : (meta.favicon ? `${siteUrl}${meta.favicon}` : `${siteUrl}/og-image.jpg`);
        }
      } catch (error) {
        console.error('Blog meta bilgileri alınırken hata:', error);
      }
    }
    
    // Portfolio/Project detay sayfası mı kontrol et
    const projectMatch = req.url.match(/\/portfolio\/([^\/]+)/);
    if (projectMatch && projectMatch[1]) {
      const projectId = projectMatch[1];
      try {
        const [projectData] = await db.execute<RowDataPacket[]>(
          'SELECT p.title, p.description, pi.image_url FROM projects p LEFT JOIN project_images pi on pi.project_id = p.id WHERE p.slug = ? and pi.type=?', 
          [projectId, "cover"]
        );
        
        if (projectData.length > 0) {
          const project = projectData[0];
          contentTitle = `${project.title} | ${meta.site_title}`;
          contentDescription = project.description || meta.site_description;
          contentImage = project.image_url 
            ? `${siteUrl}${project.image_url}` 
            : (meta.favicon ? `${siteUrl}${meta.favicon}` : `${siteUrl}/og-image.jpg`);
        }
      } catch (error) {
        console.error('Proje meta bilgileri alınırken hata:', error);
      }
    }
    
    const indexPath = path.join(__dirname, '../dist/index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Meta etiketlerini güncelle
    html = html.replace(/__META_TITLE__/g, contentTitle)
               .replace(/__META_DESCRIPTION__/g, contentDescription)
               .replace(/__META_KEYWORDS__/g, meta.site_keywords || '')
               .replace(/__META_URL__/g, `${siteUrl}${req.url}`)
               .replace(/__META_OG_IMAGE__/g, contentImage)
               .replace(/__META_FB_APP_ID__/g, meta.facebook_app_id || '')
               .replace(/__META_FAVICON__/g, meta.favicon || '')
               .replace(/__META_TWITTER_HANDLE__/g, meta.twitter_handle || '');

               return res.send(html);
  } catch (error) {
    console.error('Meta bilgileri eklenirken hata:', error);
    next();
  }
});

// Build edilmiş dosyaları sun
// SPA yönlendirmesi: Tüm istekleri index.html'e yönlendir
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Uploads klasörünü oluştur (eğer yoksa)
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 5000;

// Veritabanı bağlantısını başlat ve sunucuyu çalıştır
initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
});


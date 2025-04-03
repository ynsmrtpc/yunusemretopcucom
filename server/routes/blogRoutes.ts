import { Router, RequestHandler } from 'express';
import { getDB } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import slugify from 'slugify';
import {isAdmin, verifyToken} from "../middleware/auth";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SessionData } from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const router = Router();

interface BlogRequestBody {
    title: string;
    content: string;
    excerpt: string;
    status: 'published' | 'draft';
    plaintext: string;
    slug?: string;
    coverImage?: string;
    galleryImages?: string[];
}

// Session verisine özel alan eklemek için tipi genişletelim
interface CustomSessionData extends SessionData {
    viewedPosts?: { [key: string]: boolean }; // Örnek: { 'blog-slug': true, 'project-slug': true }
}

// Tüm blogları getir (arama ve sayfalama özelliği ile)
const getAllBlogs: RequestHandler = async (req, res, next): Promise<void> => {
    const searchTerm = req.query.q as string | undefined;
    const showDraft = req.query.showDraft as boolean | false;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM blogs';
        let countQuery = 'SELECT COUNT(*) as total FROM blogs';
        // params artık sadece arama terimlerini içerecek (string[])
        const params: string[] = []; 
        const countParams: string[] = [];
        const statusClause = showDraft ? "": " and status = 'published' "; 
        let whereClause = " WHERE 1=1 " + statusClause;

        if (searchTerm) {
            whereClause += ' and (title LIKE ? OR excerpt LIKE ?)';
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm);
            countParams.push(likeTerm, likeTerm);
        }

        query += whereClause;
        countQuery += whereClause;

        // Sıralama ve Limit/Offset ekle (doğrudan string içine)
        // Güvenlik Notu: limit ve offset parseInt ile alındığı için risk düşük.
        query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        // params.push(limit, offset); // Parametre olarak eklemeyi kaldır

        // Verileri ve toplam sayıyı getir
        const [rows] = await getDB().execute<RowDataPacket[]>(query, params); // params sadece arama terimlerini içeriyor
        const [[{ total }]] = await getDB().execute<RowDataPacket[]>(countQuery, countParams);

        // Her blog için resim bilgilerini getir
        const blogsWithImages = await Promise.all(rows.map(async (blog: RowDataPacket) => {
            // Blog resimlerini getir
            const [imageRows] = await getDB().execute<RowDataPacket[]>(
                'SELECT * FROM blog_images WHERE blog_id = ?',
                [blog.id]
            );
            
            // Kapak resmi ve galeri resimlerini ayır
            const coverImage = imageRows.find((img: RowDataPacket) => img.type === 'cover')?.image_url || null;
            const galleryImages = imageRows
                .filter((img: RowDataPacket) => img.type === 'gallery')
                .map((img: RowDataPacket) => img.image_url);
            
            // Blog ve resim bilgilerini birleştir
            return {
                ...blog,
                coverImage,
                galleryImages
            };
        }));

        // Yanıtı oluştur
        res.json({
            blogs: blogsWithImages, // Mevcut sayfa verisi
            totalBlogs: total,     // Toplam kayıt sayısı
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// Tek bir blog getir
const getBlogById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
    try {
        // Blog bilgilerini getir
        const [blogRows] = await getDB().execute<RowDataPacket[]>('SELECT * FROM blogs WHERE slug = ?', [req.params.id]);
        
        if (blogRows.length === 0) {
            res.status(404).json({ message: 'Blog bulunamadı' });
            return;
        }
        
        const blog = blogRows[0];
        
        // Blog resimlerini getir
        const [imageRows] = await getDB().execute<RowDataPacket[]>(
            'SELECT * FROM blog_images WHERE blog_id = ?',
            [blog.id]
        );
        
        // Kapak resmi ve galeri resimlerini ayır
        const coverImage = imageRows.find((img: RowDataPacket) => img.type === 'cover')?.image_url || null;
        const galleryImages = imageRows
            .filter((img: RowDataPacket) => img.type === 'gallery')
            .map((img: RowDataPacket) => img.image_url);
        
        // Blog ve resim bilgilerini birleştir
        const blogWithImages = {
            ...blog,
            coverImage,
            galleryImages
        };
        
        res.json(blogWithImages);
    } catch (error) {
        next(error);
    }
};

// Yeni blog ekle
const createBlog: RequestHandler<object, object, BlogRequestBody> = async (req, res, next): Promise<void> => {
    // req.body'den alanları doğru şekilde al
    const { title, content, plaintext, excerpt, status, coverImage, galleryImages } = req.body;

    // Gerekli alanları kontrol et (title, content, plaintext backend'de de kontrol edilebilir)
    if (!title || !content || !plaintext || !excerpt || !status) {
        return res.status(400).json({ message: 'Eksik alanlar var.' });
    }

    // Slug oluştur
    const slug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    // TODO: slug benzersizliğini kontrol et (opsiyonel ama önerilir)

    try {
        // Blog kaydını oluştur
        const [result] = await getDB().execute<ResultSetHeader>(
            'INSERT INTO blogs (title, content, plaintext, excerpt, status, slug) VALUES (?, ?, ?, ?, ?, ?)',
            // Doğru parametreleri gönder
            [title, content, plaintext, excerpt, status, slug]
        );

        const blogId = result.insertId;
        
        // Kapak resmi varsa kaydet
        if (coverImage) {
            await getDB().execute(
                'INSERT INTO blog_images (blog_id, image_url, type) VALUES (?, ?, ?)',
                [blogId, coverImage, 'cover']
            );
        }
        
        // Galeri resimleri varsa kaydet
        if (galleryImages && galleryImages.length > 0) {
            const galleryValues = galleryImages.map(imageUrl => [blogId, imageUrl, 'gallery']);
            
            for (const values of galleryValues) {
                await getDB().execute(
                    'INSERT INTO blog_images (blog_id, image_url, type) VALUES (?, ?, ?)',
                    values
                );
            }
        }
        
        res.status(201).json({ id: blogId, slug: slug, message: 'Blog başarıyla oluşturuldu' });
    } catch (error) {
        // Hata durumunda slug çakışması olabilir mi kontrol et
        if (error.code === 'ER_DUP_ENTRY') {
           return res.status(409).json({ message: 'Bu başlıkta bir blog zaten var. Lütfen farklı bir başlık deneyin.' });
        }
        next(error);
    }
};

// Blog güncelle
const updateBlog: RequestHandler<{ id: string }, object, BlogRequestBody> = async (req, res, next): Promise<void> => {
    const { title, content, plaintext, excerpt, status, coverImage, galleryImages } = req.body;
    const currentSlug = req.params.id; // Güncellenecek blog'un mevcut slug'ı

    // Gerekli alanları kontrol et
    if (!title || !content || !plaintext || !excerpt || !status) {
        return res.status(400).json({ message: 'Eksik alanlar var.' });
    }

    // Slug güncellemesi yapmayacağız, mevcut slug kullanılacak.
    // const newSlug = slugify(title, { lower: true }); 

    let connection;
    try {
        connection = await getDB().getConnection();
        await connection.beginTransaction();

        // Önce blog ID'sini ve mevcut resimleri al
        const [blogRows] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM blogs WHERE slug = ?',
            [currentSlug]
        );

        if (blogRows.length === 0) {
            await connection.rollback();
            connection.release();
            res.status(404).json({ message: 'Blog bulunamadı' });
            return;
        }

        const blogId = blogRows[0].id;

        // Silinecek eski resim URL'lerini al
        const [oldImageRows] = await connection.execute<RowDataPacket[]>(
            'SELECT image_url FROM blog_images WHERE blog_id = ?',
            [blogId]
        );
        const oldImageUrls: string[] = oldImageRows.map(row => row.image_url);

        // Blog bilgilerini güncelle (slug HARİÇ)
        await connection.execute<ResultSetHeader>(
            // 'UPDATE blogs SET title = ?, content = ?, excerpt = ?, status = ?, plaintext = ?, slug = ? WHERE id = ?',
            'UPDATE blogs SET title = ?, content = ?, plaintext = ?, excerpt = ?, status = ? WHERE id = ?',
            // newSlug parametresini kaldır
            // [title, content, excerpt, status, plaintext, newSlug, blogId]
            [title, content, plaintext, excerpt, status, blogId]
        );

        // Mevcut resim kayıtlarını veritabanından sil
        await connection.execute('DELETE FROM blog_images WHERE blog_id = ?', [blogId]);

        // Yeni kapak resmi varsa kaydet
        if (coverImage) {
            await connection.execute(
                'INSERT INTO blog_images (blog_id, image_url, type) VALUES (?, ?, ?)',
                [blogId, coverImage, 'cover']
            );
        }

        // Yeni galeri resimleri varsa kaydet
        if (galleryImages && galleryImages.length > 0) {
            const galleryValues = galleryImages.map(imageUrl => [blogId, imageUrl, 'gallery']);
            for (const values of galleryValues) {
                await connection.execute(
                    'INSERT INTO blog_images (blog_id, image_url, type) VALUES (?, ?, ?)',
                    values
                );
            }
        }

        await connection.commit();
        connection.release();

        // Veritabanı işlemleri başarılı olduktan sonra eski dosyaları sil
        for (const oldImageUrl of oldImageUrls) {
            if (oldImageUrl) {
                const filePath = path.join(projectRoot, 'public', oldImageUrl);
                try {
                    await fs.unlink(filePath);
                } catch (unlinkError: any) {
                    if (unlinkError.code !== 'ENOENT') {
                        console.error(`Eski dosya silinemedi (${filePath}):`, unlinkError);
                    }
                }
            }
        }

        // Güncellenen blogun slug'ını döndür (değişmedi ama yine de gönderelim)
        res.json({ slug: currentSlug, message: 'Blog başarıyla güncellendi' }); 
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        next(error);
    }
};

// Blog sil
const deleteBlog: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
    try {
        // Blog resimlerini sil (foreign key constraint ile otomatik silinecek)
        const [result] = await getDB().execute<ResultSetHeader>('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Blog bulunamadı' });
            return;
        }
        
        res.json({ message: 'Blog başarıyla silindi' });
    } catch (error) {
        next(error);
    }
};

// YENİ: Blog görüntüleme sayısını artırma endpoint'i
const incrementBlogView: RequestHandler<{ slug: string }> = async (req, res, next) => {
    const slug = req.params.slug;
    const session = req.session as CustomSessionData; // Tipi genişletilmiş session olarak kullan

    try {
        // Oturumda bu blog daha önce görüntülenmiş mi kontrol et
        if (!session.viewedPosts) {
            session.viewedPosts = {}; // Eğer viewedPosts yoksa oluştur
        }

        const postKey = `blog-${slug}`;
        if (session.viewedPosts[postKey]) {
            // Daha önce görüntülenmiş, sayacı artırma
            return res.status(200).json({ message: 'Already viewed in this session.' });
        }

        // Veritabanında sayacı artır
        const [result] = await getDB().execute<ResultSetHeader>(
            'UPDATE blogs SET views = views + 1 WHERE slug = ?',
            [slug]
        );

        if (result.affectedRows > 0) {
            // Görüntülendi olarak işaretle
            session.viewedPosts[postKey] = true;
            // Oturumu kaydetmeyi zorunlu kıl (isteğe bağlı, store'a göre değişebilir)
             session.save((err) => {
                 if (err) {
                     return next(err);
                 }
                 res.status(200).json({ message: 'View count incremented.' });
             });
        } else {
            // Blog bulunamadı veya güncellenemedi
            res.status(404).json({ message: 'Blog not found or view count could not be updated.' });
        }

    } catch (error) {
        next(error);
    }
};

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', verifyToken, isAdmin, createBlog);
router.put('/:id', verifyToken, isAdmin, updateBlog);
router.delete('/:id',  verifyToken, isAdmin, deleteBlog);
router.post('/:slug/view', incrementBlogView);

export default router; 
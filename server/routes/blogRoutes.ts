import { Router, RequestHandler } from 'express';
import { getDB } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import slugify from 'slugify';
import {isAdmin, verifyToken} from "../middleware/auth";

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

// Tüm blogları getir
const getAllBlogs: RequestHandler = async (_req, res, next): Promise<void> => {
    try {
        // Blog bilgilerini getir
        const [rows] = await getDB().execute<RowDataPacket[]>('SELECT * FROM blogs ORDER BY created_at DESC');
        
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
        
        res.json(blogsWithImages);
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
    const { title, content, excerpt, status, plaintext, coverImage, galleryImages } = req.body;
    const slug = slugify(title, { lower: true });
    
    try {
        // Blog kaydını oluştur
        const [result] = await getDB().execute<ResultSetHeader>(
            'INSERT INTO blogs (title, content, plaintext, excerpt, status, slug) VALUES (?, ?, ?, ?, ?, ?)',
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
        
        res.status(201).json({ id: blogId, message: 'Blog başarıyla oluşturuldu' });
    } catch (error) {
        next(error);
    }
};

// Blog güncelle
const updateBlog: RequestHandler<{ id: string }, object, BlogRequestBody> = async (req, res, next): Promise<void> => {
    const { title, content, excerpt, status, plaintext, coverImage, galleryImages } = req.body;
    const slug = slugify(title, { lower: true });

    try {
        // Önce blog ID'sini al
        const [blogRows] = await getDB().execute<RowDataPacket[]>(
            'SELECT id FROM blogs WHERE slug = ?',
            [req.params.id]
        );
        
        if (blogRows.length === 0) {
            res.status(404).json({ message: 'Blog bulunamadı' });
            return;
        }
        
        const blogId = blogRows[0].id;
        
        // Blog bilgilerini güncelle
        const [result] = await getDB().execute<ResultSetHeader>(
            'UPDATE blogs SET title = ?, content = ?, excerpt = ?, status = ?, plaintext = ?, slug = ? WHERE id = ?',
            [title, content, excerpt, status, plaintext, slug, blogId]
        );

        // Mevcut resimleri sil
        await getDB().execute('DELETE FROM blog_images WHERE blog_id = ?', [blogId]);
        
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
        
        res.json({ message: 'Blog başarıyla güncellendi' });
    } catch (error) {
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

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', verifyToken, isAdmin, createBlog);
router.put('/:id', verifyToken, isAdmin, updateBlog);
router.delete('/:id',  verifyToken, isAdmin, deleteBlog);

export default router; 
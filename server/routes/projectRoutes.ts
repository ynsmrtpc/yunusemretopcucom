import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { getDB } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import slugify from "slugify";
import {isAdmin, verifyToken} from "../middleware/auth";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SessionData } from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Session verisine özel alan eklemek için tipi genişletelim
interface CustomSessionData extends SessionData {
    viewedPosts?: { [key: string]: boolean }; 
}

const router = Router();

interface ProjectRequestBody {
    title: string;
    description: string;
    liveUrl: string;
    githubUrl: string;
    technologies: string | string[];
    plaintext: string;
    category: string;
    client: string;
    content: string;
    duration: string;
    status: string;
    year: number | string;
    slug?: string;
    coverImage?: string;
    galleryImages?: string[];
}

// Tüm projeleri getir (arama ve sayfalama özelliği ile)
const getAllProjects: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const searchTerm = req.query.q as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM projects';
        let countQuery = 'SELECT COUNT(*) as total FROM projects';
        const params: string[] = [];
        const countParams: string[] = [];

        if (searchTerm) {
            const whereClause = ' WHERE title LIKE ? OR description LIKE ? OR content LIKE ? OR plaintext LIKE ? OR category LIKE ? OR technologies LIKE ?';
            query += whereClause;
            countQuery += whereClause;
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
            countParams.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
        }

        query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

        const [rows] = await getDB().execute<RowDataPacket[]>(query, params);
        const [[{ total }]] = await getDB().execute<RowDataPacket[]>(countQuery, countParams);

        // Her proje için resim bilgilerini getir
        const projectsWithImages = await Promise.all(rows.map(async (project: RowDataPacket) => {
            // Proje resimlerini getir
            const [imageRows] = await getDB().execute<RowDataPacket[]>(
                'SELECT * FROM project_images WHERE project_id = ?',
                [project.id]
            );
            
            // Kapak resmi ve galeri resimlerini ayır
            const coverImage = imageRows.find((img: RowDataPacket) => img.type === 'cover')?.image_url || null;
            const galleryImages = imageRows
                .filter((img: RowDataPacket) => img.type === 'gallery')
                .map((img: RowDataPacket) => img.image_url);
            
            // Proje ve resim bilgilerini birleştir
            return {
                ...project,
                coverImage,
                galleryImages
            };
        }));

        // Yanıtı oluştur
        res.json({
            projects: projectsWithImages,
            totalProjects: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// Tek bir proje getir
const getProjectById: RequestHandler<{ id: string }> = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Proje bilgilerini getir
        const [projectRows] = await getDB().execute<RowDataPacket[]>('SELECT * FROM projects WHERE slug = ?', [req.params.id]);
        
        if (projectRows.length === 0) {
            res.status(404).json({ message: 'Proje bulunamadı' });
            return;
        }
        
        const project = projectRows[0];
        
        // Proje resimlerini getir
        const [imageRows] = await getDB().execute<RowDataPacket[]>(
            'SELECT * FROM project_images WHERE project_id = ?',
            [project.id]
        );
        
        // Kapak resmi ve galeri resimlerini ayır
        const coverImage = imageRows.find((img: RowDataPacket) => img.type === 'cover')?.image_url || null;
        const galleryImages = imageRows
            .filter((img: RowDataPacket) => img.type === 'gallery')
            .map((img: RowDataPacket) => img.image_url);
        
        // Proje ve resim bilgilerini birleştir
        const projectWithImages = {
            ...project,
            coverImage,
            galleryImages
        };
        
        res.json(projectWithImages);
    } catch (error) {
        next(error);
    }
};

// Yeni proje ekle
const createProject: RequestHandler<object, object, ProjectRequestBody> = async (req: Request<object, object, ProjectRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { 
        title, description, category, client, content, duration, githubUrl, liveUrl, 
        plaintext, status, technologies, year, coverImage, galleryImages 
    } = req.body;
    
    if (!title || !content || !plaintext || !description || !category || !status || !year) {
        return res.status(400).json({ message: 'Eksik alanlar var.' });
    }

    const slug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    const technologiesArray = (typeof technologies === "string" )? technologies.split(',').map((tech: string) => tech.trim()) : technologies;

    try {
        const [result] = await getDB().execute<ResultSetHeader>(
            'INSERT INTO projects (title, description, category, client, content, duration, githubUrl, liveUrl, plaintext, status, technologies, year, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, category, client, content, duration, githubUrl, liveUrl, plaintext, status, JSON.stringify(technologiesArray), year, slug]
        );
        
        const projectId = result.insertId;
        
        // Kapak resmi varsa kaydet
        if (coverImage) {
            await getDB().execute(
                'INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)',
                [projectId, coverImage, 'cover']
            );
        }
        
        // Galeri resimleri varsa kaydet
        if (galleryImages && galleryImages.length > 0) {
            const galleryValues = galleryImages.map((imageUrl: string) => [projectId, imageUrl, 'gallery']);
            
            for (const values of galleryValues) {
                await getDB().execute(
                    'INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)',
                    values
                );
            }
        }
        
        res.status(201).json({ id: projectId, slug: slug, message: 'Proje başarıyla oluşturuldu' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
           return res.status(409).json({ message: 'Bu başlıkta bir proje zaten var. Lütfen farklı bir başlık deneyin.' });
        }
        next(error);
    }
};

// Proje güncelle
const updateProject: RequestHandler<{ id: string }, object, ProjectRequestBody> = async (req: Request<{ id: string }, object, ProjectRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { 
        title, description, category, client, content, duration, githubUrl, liveUrl, 
        plaintext, status, technologies, year, coverImage, galleryImages 
    } = req.body;
    
    const currentSlug = req.params.id;
    const technologiesArray = (typeof technologies === "string" )? technologies.split(',').map((tech: string) => tech.trim()) : technologies;
    
    if (!title || !content || !plaintext || !description || !category || !status || !year) {
        return res.status(400).json({ message: 'Eksik alanlar var.' });
    }

    let connection;
    try {
        connection = await getDB().getConnection();
        await connection.beginTransaction();

        // Önce proje ID'sini ve mevcut resimleri al
        const [projectRows] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM projects WHERE slug = ?',
            [currentSlug]
        );
        
        if (projectRows.length === 0) {
            await connection.rollback();
            connection.release();
            res.status(404).json({ message: 'Proje bulunamadı' });
            return;
        }
        
        const projectId = projectRows[0].id;

        // Silinecek eski resim URL'lerini al
        const [oldImageRows] = await connection.execute<RowDataPacket[]>(
            'SELECT image_url FROM project_images WHERE project_id = ?',
            [projectId]
        );
        const oldImageUrls: string[] = oldImageRows.map((row: RowDataPacket) => row.image_url);
        
        // Proje bilgilerini güncelle (slug HARİÇ, sütun isimleri düzeltildi)
        await connection.execute<ResultSetHeader>(
            'UPDATE projects SET title = ?, description = ?, category = ?, client = ?, content = ?, duration = ?, githubUrl = ?, liveUrl = ?, plaintext = ?, status = ?, technologies = ?, year = ? WHERE id = ?',
            [title, description, category, client, content, duration, githubUrl, liveUrl, plaintext, status, JSON.stringify(technologiesArray), year, projectId]
        );
        
        // Mevcut resim kayıtlarını veritabanından sil
        await connection.execute('DELETE FROM project_images WHERE project_id = ?', [projectId]);
        
        // Yeni kapak resmi varsa kaydet
        if (coverImage) {
            await connection.execute(
                'INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)',
                [projectId, coverImage, 'cover']
            );
        }
        
        // Yeni galeri resimleri varsa kaydet
        if (galleryImages && galleryImages.length > 0) {
            const galleryValues = galleryImages.map((imageUrl: string) => [projectId, imageUrl, 'gallery']);
            
            for (const values of galleryValues) {
                await connection.execute(
                    'INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)',
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
        
        res.json({ slug: currentSlug, message: 'Proje başarıyla güncellendi' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        next(error);
    }
};

// Proje sil
const deleteProject: RequestHandler<{ id: string }> = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    let connection;
    try {
        connection = await getDB().getConnection();
        await connection.beginTransaction();

        // Silinecek proje ID'sini al
        const [projectRows] = await connection.execute<RowDataPacket[]>('SELECT id FROM projects WHERE id = ?', [req.params.id]);

        if (projectRows.length === 0) {
            await connection.rollback();
            connection.release();
            res.status(404).json({ message: 'Proje bulunamadı' });
            return;
        }
        const projectId = projectRows[0].id;

        // Önce silinecek resimlerin URL'lerini al (fiziksel silme için)
        const [oldImageRows] = await connection.execute<RowDataPacket[]>('SELECT image_url FROM project_images WHERE project_id = ?', [projectId]);
        const oldImageUrls: string[] = oldImageRows.map((row: RowDataPacket) => row.image_url);

        // Veritabanından projeyi sil (ilişkili resim kayıtları da silinmeli - CASCADE varsa)
        // Önce resim kayıtlarını sil
        await connection.execute('DELETE FROM project_images WHERE project_id = ?', [projectId]);
        // Sonra projeyi sil
        const [result] = await connection.execute<ResultSetHeader>('DELETE FROM projects WHERE id = ?', [projectId]);
        
        if (result.affectedRows === 0) {
            // Bu durum yukarıdaki kontrol nedeniyle pek olası değil
            await connection.rollback();
            connection.release();
            res.status(404).json({ message: 'Proje bulunamadı veya silinemedi' });
            return;
        }

        await connection.commit();
        connection.release();

        // Veritabanı silme başarılı olduktan sonra eski dosyaları sil
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
        
        res.json({ message: 'Proje başarıyla silindi' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        next(error);
    }
};

// YENİ: Proje görüntüleme sayısını artırma endpoint'i
const incrementProjectView: RequestHandler<{ slug: string }> = async (req, res, next) => {
    const slug = req.params.slug;
    const session = req.session as CustomSessionData; 

    try {
        if (!session.viewedPosts) {
            session.viewedPosts = {}; 
        }

        const postKey = `project-${slug}`;
        if (session.viewedPosts[postKey]) {
            return res.status(200).json({ message: 'Already viewed in this session.' });
        }

        const [result] = await getDB().execute<ResultSetHeader>(
            'UPDATE projects SET views = views + 1 WHERE slug = ?',
            [slug]
        );

        if (result.affectedRows > 0) {
            session.viewedPosts[postKey] = true;
             session.save((err) => {
                 if (err) {
                     return next(err);
                 }
                 res.status(200).json({ message: 'View count incremented.' });
             });
        } else {
            res.status(404).json({ message: 'Project not found or view count could not be updated.' });
        }

    } catch (error) {
        next(error);
    }
};

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', verifyToken, isAdmin, createProject);
router.put('/:id', verifyToken, isAdmin, updateProject);
router.delete('/:id', verifyToken, isAdmin, deleteProject);
router.post('/:slug/view', incrementProjectView);

export default router; 
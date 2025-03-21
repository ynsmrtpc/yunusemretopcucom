import { Router, RequestHandler } from 'express';
import { getDB } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import slugify from "slugify";
import {isAdmin, verifyToken} from "../middleware/auth";

const router = Router();

interface ProjectRequestBody {
    title: string;
    description: string;
    live_url: string;
    github_url: string;
    technologies: string;
    plaintext: string;
    category: string;
    client: string;
    content: string;
    duration: string;
    status: string;
    year: number;
    slug?: string;
    coverImage?: string;
    galleryImages?: string[];
}

// Tüm projeleri getir
const getAllProjects: RequestHandler = async (_req, res, next): Promise<void> => {
    try {
        // Proje bilgilerini getir
        const [rows] = await getDB().execute<RowDataPacket[]>('SELECT * FROM projects ORDER BY created_at DESC');
        
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
        
        res.json(projectsWithImages);
    } catch (error) {
        next(error);
    }
};

// Tek bir proje getir
const getProjectById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
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
const createProject: RequestHandler<object, object, ProjectRequestBody> = async (req, res, next): Promise<void> => {
    const { 
        category, client, content, description, duration, github_url, live_url, 
        plaintext, status, technologies, title, year, coverImage, galleryImages 
    } = req.body;
    
    const slug = slugify(title, { lower: true });
    const technologiesArray = (typeof technologies === "string" )? technologies.split(',').map((tech: string) => tech.trim()) : technologies;

    try {
        // Proje kaydını oluştur
        const [result] = await getDB().execute<ResultSetHeader>(
            'INSERT INTO projects (category, client, content, description, duration, github_url, live_url, plaintext, status, technologies, title, year, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [category, client, content, description, duration, github_url, live_url, plaintext, status, technologiesArray, title, year, slug]
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
            const galleryValues = galleryImages.map(imageUrl => [projectId, imageUrl, 'gallery']);
            
            for (const values of galleryValues) {
                await getDB().execute(
                    'INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)',
                    values
                );
            }
        }
        
        res.status(201).json({ id: projectId, message: 'Proje başarıyla oluşturuldu' });
    } catch (error) {
        next(error);
    }
};

// Proje güncelle
const updateProject: RequestHandler<{ id: string }, object, ProjectRequestBody> = async (req, res, next): Promise<void> => {
    const { 
        category, client, content, description, duration, github_url, live_url, 
        plaintext, status, technologies, title, year, coverImage, galleryImages 
    } = req.body;
    
    const slug = slugify(title, { lower: true });
    const technologiesArray = (typeof technologies === "string" )? technologies.split(',').map((tech: string) => tech.trim()) : technologies;
    
    try {
        // Önce proje ID'sini al
        const [projectRows] = await getDB().execute<RowDataPacket[]>(
            'SELECT id FROM projects WHERE slug = ?',
            [req.params.id]
        );
        
        if (projectRows.length === 0) {
            res.status(404).json({ message: 'Proje bulunamadı' });
            return;
        }
        
        const projectId = projectRows[0].id;
        
        // Proje bilgilerini güncelle
        const [result] = await getDB().execute<ResultSetHeader>(
            'UPDATE projects SET category = ?, client = ?, content = ?, description = ?, duration = ?, github_url = ?, live_url = ?, plaintext = ?, status = ?, technologies = ?, title = ?, year = ?, slug = ? WHERE id = ?',
            [category, client, content, description, duration, github_url, live_url, plaintext, status, technologiesArray, title, year, slug, projectId]
        );
        
        // Mevcut resimleri sil
        await getDB().execute('DELETE FROM project_images WHERE project_id = ?', [projectId]);
        
        // Kapak resmi varsa kaydet
        if (coverImage) {
            await getDB().execute(
                'INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)',
                [projectId, coverImage, 'cover']
            );
        }
        
        // Galeri resimleri varsa kaydet
        if (galleryImages && galleryImages.length > 0) {
            const galleryValues = galleryImages.map(imageUrl => [projectId, imageUrl, 'gallery']);
            
            for (const values of galleryValues) {
                await getDB().execute(
                    'INSERT INTO project_images (project_id, image_url, type) VALUES (?, ?, ?)',
                    values
                );
            }
        }
        
        res.json({ message: 'Proje başarıyla güncellendi' });
    } catch (error) {
        next(error);
    }
};

// Proje sil
const deleteProject: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
    try {
        // Proje resimlerini sil (foreign key constraint ile otomatik silinecek)
        const [result] = await getDB().execute<ResultSetHeader>('DELETE FROM projects WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Proje bulunamadı' });
            return;
        }
        
        res.json({ message: 'Proje başarıyla silindi' });
    } catch (error) {
        next(error);
    }
};

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', verifyToken, isAdmin, createProject);
router.put('/:id', verifyToken, isAdmin, updateProject);
router.delete('/:id', verifyToken, isAdmin, deleteProject);

export default router; 
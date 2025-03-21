import { Router, Request, Response } from 'express';
import { getDB } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { isAdmin, verifyToken } from "../middleware/auth";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();

// ESM için __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Depolama ayarları
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: Function) {
        const uploadsDir = path.join(__dirname, '../../public/uploads/meta');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'meta-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Meta ayarlarını getir
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getDB();
        const [metaSettings] = await db.execute<RowDataPacket[]>('SELECT * FROM meta_settings LIMIT 1');
        
        // Eğer meta ayarları yoksa, varsayılan değerlerle oluştur
        if (metaSettings.length === 0) {
            await db.execute(`
                INSERT INTO meta_settings (
                    site_title, 
                    site_description, 
                    site_keywords, 
                    og_image, 
                    favicon, 
                    twitter_handle, 
                    facebook_app_id, 
                    google_analytics_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'Portfolio', 
                'Kişisel portfolio websitesi', 
                'portfolio, web geliştirme, projeler', 
                null, 
                null, 
                '', 
                '', 
                ''
            ]);
            
            const [newSettings] = await db.execute<RowDataPacket[]>('SELECT * FROM meta_settings LIMIT 1');
            return res.json(newSettings[0]);
        }
        
        res.json(metaSettings[0]);
    } catch (error) {
        console.error('Meta ayarları alınırken hata:', error);
        res.status(500).json({ error: 'Meta ayarları alınamadı' });
    }
});

// Meta ayarlarını güncelle
router.put('/', verifyToken, isAdmin, upload.fields([
    { name: 'og_image', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), async (req: Request, res: Response) => {
    try {
        const { 
            site_title, 
            site_description, 
            site_keywords, 
            twitter_handle, 
            facebook_app_id, 
            google_analytics_id 
        } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        const db = getDB();
        
        // Mevcut ayarları al
        const [currentSettings] = await db.execute<RowDataPacket[]>('SELECT * FROM meta_settings LIMIT 1');
        const current = currentSettings[0] || {};
        
        // Yeni dosya yolları
        let og_image = current.og_image;
        let favicon = current.favicon;
        
        // Yüklenen dosyaları işle
        if (files && files.og_image && files.og_image[0]) {
            og_image = `/uploads/meta/${files.og_image[0].filename}`;
        }
        
        if (files && files.favicon && files.favicon[0]) {
            favicon = `/uploads/meta/${files.favicon[0].filename}`;
        }
        
        // Meta ayarlarını güncelle
        await db.execute(`
            UPDATE meta_settings SET 
                site_title = ?,
                site_description = ?,
                site_keywords = ?,
                og_image = ?,
                favicon = ?,
                twitter_handle = ?,
                facebook_app_id = ?,
                google_analytics_id = ?
            WHERE id = ?
        `, [
            site_title,
            site_description,
            site_keywords,
            og_image,
            favicon,
            twitter_handle,
            facebook_app_id,
            google_analytics_id,
            current.id || 1
        ]);
        
        // Güncellenmiş ayarları döndür
        const [updatedSettings] = await db.execute<RowDataPacket[]>('SELECT * FROM meta_settings LIMIT 1');
        res.json(updatedSettings[0]);
    } catch (error) {
        console.error('Meta ayarları güncellenirken hata:', error);
        res.status(500).json({ error: 'Meta ayarları güncellenemedi' });
    }
});

export default router;
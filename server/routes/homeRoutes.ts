import { Router, Request, Response } from 'express';
import { getDB } from '../config/db';
import { RowDataPacket } from 'mysql2';
import {isAdmin, verifyToken} from "../middleware/auth";

const router = Router();

// Anasayfa içeriğini getir
router.get('/', async (req: Request, res: Response) =>  {
    try {
        const db = getDB();
        const [homeData] = await db.execute<RowDataPacket[]>('SELECT * FROM home LIMIT 1');
        const [services] = await db.execute<RowDataPacket[]>('SELECT * FROM services ORDER BY id ASC');

        if (!homeData[0]) {
            return res.status(404).json({ error: 'Anasayfa içeriği bulunamadı' });
        }

        res.json({
            ...homeData[0],
            services
        });
    } catch (error) {
        console.error('Anasayfa içeriği alınırken hata:', error);
        res.status(500).json({ error: 'Anasayfa içeriği alınamadı'});
    }
});

// Anasayfa içeriğini güncelle
router.put('/', verifyToken, isAdmin,  async (req: Request, res: Response) => {
    try {
        const {
            hero_title,
            hero_subtitle,
            hero_image,
            about_section_title,
            about_section_content,
            about_section_image,
            services_section_title,
            services
        } = req.body;

        const db = getDB();

        // Ana içeriği güncelle
        await db.execute(
            `UPDATE home SET 
                hero_title = ?,
                hero_subtitle = ?,
                hero_image = ?,
                about_section_title = ?,
                about_section_content = ?,
                about_section_image = ?,
                services_section_title = ?
            WHERE id = 1`,
            [
                hero_title || null,
                hero_subtitle || null,
                hero_image || null,
                about_section_title || null,
                about_section_content || null,
                about_section_image || null,
                services_section_title || null
            ]
        );

        // Servisleri güncelle
        if (services && Array.isArray(services)) {
            await db.execute('DELETE FROM services');
            for (const service of services) {
                await db.execute(
                    'INSERT INTO services (title, description, icon) VALUES (?, ?, ?)',
                    [
                        service.title || null,
                        service.description || null,
                        service.icon || null
                    ]
                );
            }
        }

        res.json({ message: 'Anasayfa içeriği başarıyla güncellendi' });
    } catch (error) {
        console.error('Anasayfa içeriği güncellenirken hata:', error);
        res.status(500).json({ error: 'Anasayfa içeriği güncellenemedi' });
    }
});

export default router; 
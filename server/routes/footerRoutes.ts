import { Router, Request, Response } from 'express';
import { getDB } from '../config/db';
import { RowDataPacket } from 'mysql2';
import {isAdmin, verifyToken} from "../middleware/auth";

const router = Router();

// Footer içeriğini getir
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getDB();
        const [footerData] = await db.execute<RowDataPacket[]>('SELECT * FROM footer LIMIT 1');
        const [navigationLinks] = await db.execute<RowDataPacket[]>('SELECT * FROM footer_navigation_links ORDER BY id ASC');
        const [socialLinks] = await db.execute<RowDataPacket[]>('SELECT * FROM footer_social_links ORDER BY id ASC');

        res.json({
            ...footerData[0],
            navigation_links: navigationLinks,
            social_links: socialLinks
        });
    } catch (error) {
        console.error('Footer içeriği alınırken hata:', error);
        res.status(500).json({ error: 'Footer içeriği alınamadı' });
    }
});

// Footer içeriğini güncelle
router.put('/', verifyToken, isAdmin,  async (req: Request, res: Response) => {
    try {
        const { logo, description, copyright_text, navigation_links, social_links } = req.body;

        const db = getDB();
        
        // Footer ana içeriğini güncelle
        await db.execute(
            `UPDATE footer SET 
                logo = ?,
                description = ?,
                copyright_text = ?
            WHERE id = 1`,
            [logo, description, copyright_text]
        );

        // Navigation linklerini güncelle
        if (navigation_links && Array.isArray(navigation_links)) {
            await db.execute('DELETE FROM footer_navigation_links');
            for (const link of navigation_links) {
                await db.execute(
                    'INSERT INTO footer_navigation_links (title, url) VALUES (?, ?)',
                    [link.title, link.url]
                );
            }
        }

        // Sosyal medya linklerini güncelle
        if (social_links && Array.isArray(social_links)) {
            await db.execute('DELETE FROM footer_social_links');
            for (const link of social_links) {
                await db.execute(
                    'INSERT INTO footer_social_links (platform, url, icon) VALUES (?, ?, ?)',
                    [link.platform, link.url, link.icon]
                );
            }
        }

        res.json({ message: 'Footer içeriği başarıyla güncellendi' });
    } catch (error) {
        console.error('Footer içeriği güncellenirken hata:', error);
        res.status(500).json({ error: 'Footer içeriği güncellenemedi' });
    }
});

export default router; 
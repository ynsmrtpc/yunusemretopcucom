import { Router, Request, Response } from 'express';
import { getDB } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { isAdmin, verifyToken } from "../middleware/auth";

const router = Router();

// Navbar içeriğini getir
router.get('/', async (req: Request, res: Response) => {
    try {
        const db = getDB();
        const [navbarData] = await db.execute<RowDataPacket[]>('SELECT * FROM navbar LIMIT 1');
        const [navigationLinks] = await db.execute<RowDataPacket[]>('SELECT * FROM navbar_navigation_links ORDER BY order_index ASC');

        res.json({
            ...navbarData[0],
            navigation_links: navigationLinks
        });
    } catch (error) {
        console.error('Navbar içeriği alınırken hata:', error);
        res.status(500).json({ error: 'Navbar içeriği alınamadı' });
    }
});

// Navbar içeriğini güncelle
router.put('/', verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { site_title, logo, navigation_links } = req.body;

        const db = getDB();
        
        // Navbar ana içeriğini güncelle
        await db.execute(
            `UPDATE navbar SET 
                site_title = ?,
                logo = ?
            WHERE id = 1`,
            [site_title, logo]
        );

        // Navigation linklerini güncelle
        if (navigation_links && Array.isArray(navigation_links)) {
            await db.execute('DELETE FROM navbar_navigation_links');
            for (const link of navigation_links) {
                await db.execute(
                    'INSERT INTO navbar_navigation_links (title, url, order_index) VALUES (?, ?, ?)',
                    [link.title, link.url, link.order_index || 0]
                );
            }
        }

        res.json({ message: 'Navbar içeriği başarıyla güncellendi' });
    } catch (error) {
        console.error('Navbar içeriği güncellenirken hata:', error);
        res.status(500).json({ error: 'Navbar içeriği güncellenemedi' });
    }
});

export default router; 
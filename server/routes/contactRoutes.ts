import { Router, Request, Response } from 'express';
import { getDB } from '../config/db';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {isAdmin, verifyToken} from "../middleware/auth";

const router = Router();

// İletişim bilgilerini getir
router.get('/', async (_req: Request, res: Response) => {
    try {
        const db = getDB();
        const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM contact LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('İletişim bilgileri alınırken hata:', error);
        res.status(500).json({ error: 'İletişim bilgileri alınamadı' });
    }
});

// Yeni mesaj oluştur
router.post('/messages', async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;
        const db = getDB();
        await db.execute(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        res.status(201).json({ message: 'Mesaj başarıyla gönderildi' });
    } catch (error) {
        console.error('Mesaj gönderilirken hata:', error);
        res.status(500).json({ error: 'Mesaj gönderilemedi' });
    }
});

// İletişim bilgilerini güncelle
router.put('/',  verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { email, phone, address, github_url, linkedin_url, twitter_url, instagram_url } = req.body;
        const [existingRows] = await getDB().execute<RowDataPacket[]>('SELECT * FROM contact LIMIT 1');

        if (existingRows.length === 0) {
            // Kayıt yoksa yeni kayıt oluştur
            const [result] = await getDB().execute<ResultSetHeader>(
                'INSERT INTO contact (email, phone, address, github_url,linkedin_url,twitter_url,instagram_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [email, phone, address, github_url, linkedin_url, twitter_url, instagram_url]
            );
            res.status(201).json({ id: result.insertId, message: 'İletişim bilgileri başarıyla oluşturuldu' });
        } else {
            // Varolan kaydı güncelle
            await getDB().execute<ResultSetHeader>(
                `UPDATE contact 
                 SET email = ?, phone = ?, address = ?, github_url = ?, linkedin_url = ?, twitter_url = ?, instagram_url = ?`,
                [email, phone, address, github_url, linkedin_url, twitter_url, instagram_url]
            );
            res.json({ message: 'İletişim bilgileri başarıyla güncellendi' });
        }
    } catch (error) {
        console.error('İletişim bilgileri güncellenirken hata:', error);
        res.status(500).json({ error: 'İletişim bilgileri güncellenemedi' });
    }
});

// Tüm mesajları getir
router.get('/messages',  verifyToken, isAdmin, async (_req: Request, res: Response) => {
    try {
        const db = getDB();
        const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Mesajlar alınırken hata:', error);
        res.status(500).json({ error: 'Mesajlar alınamadı' });
    }
});

// Mesaj sil
router.delete('/messages/:id',  verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const db = getDB();
        await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
        res.json({ message: 'Mesaj başarıyla silindi' });
    } catch (error) {
        console.error('Mesaj silinirken hata:', error);
        res.status(500).json({ error: 'Mesaj silinemedi' });
    }
});

export default router; 
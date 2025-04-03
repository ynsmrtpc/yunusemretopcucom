import { Router, Request, Response } from 'express';
import { getDB } from '../config/db';
import { RowDataPacket } from 'mysql2';
import {isAdmin, verifyToken} from "../middleware/auth";

const router = Router();

// Dashboard istatistiklerini getir
router.get('/stats', verifyToken, isAdmin, async (_req: Request, res: Response) => {
    try {
        const db = getDB();
        
        // Blog, proje ve mesaj sayılarını al
        const [blogCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM blogs');
        const [projectCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM projects');
        const [messageCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM contact_messages');
        
        // Toplam görüntülenme sayısını hesapla
        const [blogViews] = await db.execute<RowDataPacket[]>('SELECT SUM(views) as total FROM blogs');
        const [projectViews] = await db.execute<RowDataPacket[]>('SELECT SUM(views) as total FROM projects');

        const stats = {
            blogs: blogCount[0].count,
            projects: projectCount[0].count,
            messages: messageCount[0].count,
            totalViews: parseInt(blogViews[0]?.total || 0) + parseInt(projectViews[0]?.total || 0)
        };

        res.json(stats);
    } catch (error) {
        console.error('Dashboard istatistikleri alınırken hata:', error);
        res.status(500).json({ error: 'Dashboard istatistikleri alınamadı' + error });
    }
});

// Son blog yazılarını getir
router.get('/recent-posts', verifyToken, isAdmin, async (_req: Request, res: Response) => {
    try {
        const db = getDB();
        const [posts] = await db.execute<RowDataPacket[]>(
            'SELECT id, title, views, created_at FROM blogs ORDER BY created_at DESC LIMIT 5'
        );

        const formattedPosts = posts.map((post: RowDataPacket) => ({
            id: post.id,
            title: post.title,
            date: new Date(post.created_at).toLocaleDateString('tr-TR'),
            views: post.views
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error('Son blog yazıları alınırken hata:', error);
        res.status(500).json({ error: 'Son blog yazıları alınamadı' });
    }
});

// Son mesajları getir
router.get('/recent-messages', verifyToken, isAdmin, async (_req: Request, res: Response) => {
    try {
        const db = getDB();
        const [messages] = await db.execute<RowDataPacket[]>(
            'SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5'
        );

        const formattedMessages = messages.map((message: RowDataPacket) => ({
            id: message.id,
            name: message.name,
            email: message.email,
            message: message.message,
            date: new Date(message.created_at).toLocaleDateString('tr-TR')
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error('Son mesajlar alınırken hata:', error);
        res.status(500).json({ error: 'Son mesajlar alınamadı' });
    }
});

export default router; 
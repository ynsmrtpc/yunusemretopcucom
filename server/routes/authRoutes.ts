import { Router, Request, Response } from 'express';
import { getDB } from '../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, isAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation şemaları
const registerSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir email adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    role: z.enum(['admin', 'editor']).default('editor')
});

const loginSchema = z.object({
    email: z.string().email('Geçerli bir email adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
});

const updateUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'user']),
    password: z.string().min(6).optional(),
});

// Kayıt ol
router.post('/register', verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password, role } = validatedData;

        // Email kontrolü
        const [existingUsers] = await getDB().execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı kaydet
        await getDB().execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Kayıt olma hatası:', error);
        res.status(500).json({ message: 'Kayıt işlemi başarısız oldu' });
    }
});

// Giriş yap
router.post('/login', async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        // Kullanıcıyı bul
        const [users] = await getDB().execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Email veya şifre hatalı' });
        }

        const user = users[0];

        // Şifreyi kontrol et
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Email veya şifre hatalı' });
        }

        // Token oluştur
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Token'ı httpOnly cookie olarak ayarla
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 saat
        });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Giriş yapma hatası:', error);
        res.status(500).json({ message: 'Giriş işlemi başarısız oldu' });
    }
});

// Çıkış yap
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Başarıyla çıkış yapıldı' });
});

// Mevcut kullanıcı bilgilerini getir
router.get('/me', verifyToken, async (req: Request, res: Response) => {
    try {
        const [users] = await getDB().execute<RowDataPacket[]>(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [(req as any).user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Kullanıcı bilgileri alma hatası:', error);
        res.status(500).json({ message: 'Kullanıcı bilgileri alınamadı' });
    }
});

// Tüm kullanıcıları getir (sadece admin)
router.get('/users', verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const [users] = await getDB().execute<RowDataPacket[]>(
            'SELECT id, name, email, role, created_at FROM users'
        );

        res.json(users);
    } catch (error) {
        console.error('Kullanıcıları getirme hatası:', error);
        res.status(500).json({ message: 'Kullanıcılar alınamadı' });
    }
});

// Kullanıcı güncelle (sadece admin)
router.put('/users/:id', verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = updateUserSchema.parse(req.body);

        // Email benzersizliğini kontrol et
        const [existingUsers] = await getDB().execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [validatedData.email, id]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
        }

        // Temel güncelleme sorgusu
        let query = 'UPDATE users SET name = ?, email = ?, role = ?';
        let params = [validatedData.name, validatedData.email, validatedData.role];

        // Eğer şifre değiştirilecekse
        if (validatedData.password) {
            const hashedPassword = await bcrypt.hash(validatedData.password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        // WHERE koşulunu ekle
        query += ' WHERE id = ?';
        params.push(id);

        await getDB().execute(query, params);

        res.json({ message: 'Kullanıcı başarıyla güncellendi' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Kullanıcı güncelleme hatası:', error);
        res.status(500).json({ message: 'Kullanıcı güncellenemedi' });
    }
});

// Kullanıcı sil (sadece admin)
router.delete('/users/:id', verifyToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Kendini silmeye çalışıyor mu kontrol et
        if (id === (req as any).user.id) {
            return res.status(400).json({ message: 'Kendinizi silemezsiniz' });
        }

        await getDB().execute('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'Kullanıcı başarıyla silindi' });
    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        res.status(500).json({ message: 'Kullanıcı silinemedi' });
    }
});

export default router; 
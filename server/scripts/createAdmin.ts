import bcrypt from 'bcryptjs';
import { getDB, initializeDB } from '../config/db.js';
import { RowDataPacket } from 'mysql2';
import 'dotenv/config';

async function createAdminUser() {
    try {
        // Önce veritabanı bağlantısını başlat
        await initializeDB();
        
        const db = getDB();
        
        // Admin kullanıcısı için bilgiler
        const adminUser = {
            name: 'Yunus Emre Topçu',
            email: 'admin@yunusemretopcu.com',
            password: 'adminYunus1907**', // Bu şifreyi değiştirin
            role: 'admin' as const
        };

        // Email kontrolü
        const [existingUsers] = await db.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [adminUser.email]
        );

        if (existingUsers.length > 0) {
            console.log('Admin kullanıcısı zaten mevcut');
            process.exit(0);
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);

        // Admin kullanıcısını oluştur
        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [adminUser.name, adminUser.email, hashedPassword, adminUser.role]
        );

        console.log('Admin kullanıcısı başarıyla oluşturuldu');
        process.exit(0);
    } catch (error) {
        console.error('Admin kullanıcısı oluşturulurken hata:', error);
        process.exit(1);
    }
}

// Script'i çalıştır
createAdminUser(); 
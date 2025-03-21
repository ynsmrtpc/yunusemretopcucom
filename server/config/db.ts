import mysql from 'mysql2/promise';
import 'dotenv/config';

// Veritabanı bağlantı konfigürasyonu
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,  // Bağlantı kuyruğunda beklesin
    connectionLimit: 10,       // Maksimum 10 bağlantı açık olabilir
    queueLimit: 0              // Kuyruk limiti yok
};

// Global bağlantı değişkeni
let db: mysql.Pool | null = null;

// Veritabanı bağlantısını oluştur
export const initializeDB = async () => {
    try {
        db = mysql.createPool(dbConfig); // ❗ Artık `db` bir bağlantı havuzu oldu
        const connection = await db.getConnection();
        console.log('✅ Database connection successful');
        connection.release(); // Bağlantıyı geri bırak
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

// Bağlantıyı getir
export const getDB = () => {
    if (!db) {
        throw new Error('Database connection not initialized');
    }
    return db;
};

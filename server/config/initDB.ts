import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT || "3306"),
        multipleStatements: true // Birden fazla SQL ifadesini aynı anda çalıştırmak için
    };

    try {
        // MySQL bağlantısı oluştur
        const connection = await mysql.createConnection(dbConfig);
        
        // Veritabanını oluştur ve seç
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);
        
        // Schema dosyasını oku
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Schema'yı uygula
        await connection.query(schema);
        
        // Users tablosu
        const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`;
        
        await connection.query(createUsersTable);
        
        console.log('Veritabanı başarıyla oluşturuldu ve şema uygulandı');
        
        // Bağlantıyı kapat
        await connection.end();
        
        process.exit(0);
    } catch (error) {
        console.error('Veritabanı oluşturulurken hata:', error);
        process.exit(1);
    }
}

initializeDatabase(); 
import { Router, RequestHandler } from 'express';
import { getDB } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {isAdmin, verifyToken} from "../middleware/auth";

const router = Router();

interface AboutRequestBody {
    content: string;
    skills: Array<string> | string;
    experience: string;
    education: string;
    plaintext: string;
    certifications: Array<string>;
}

// About bilgisini getir
const getAbout: RequestHandler = async (_req, res, next): Promise<void> => {
    try {
        const [rows] = await getDB().execute<RowDataPacket[]>('SELECT * FROM about LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        next(error);
    }
};

// About bilgisini güncelle
const updateAbout: RequestHandler<object, object, AboutRequestBody> = async (req, res, next): Promise<void> => {
    const { content, skills, experience, education, plaintext, certifications } = req.body;
    const {htmlData,textData} = content;
    const JSONskills = (typeof skills === "string") ? skills.split(",") : skills;
    try {
        const [existingRows] = await getDB().execute<RowDataPacket[]>('SELECT * FROM about LIMIT 1');
        
        if (existingRows.length === 0) {
            // Kayıt yoksa yeni kayıt oluştur
            const [result] = await getDB().execute<ResultSetHeader>(
                'INSERT INTO about (content, skills, experience, education,plaintext,certifications) VALUES (?, ?, ?, ?, ?, ?)',
                [htmlData, JSONskills, experience, education, textData,certifications]
            );
            res.status(201).json({ id: result.insertId, message: 'About bilgisi başarıyla oluşturuldu' });
        } else {
            // Varolan kaydı güncelle
            await getDB().execute<ResultSetHeader>(
                'UPDATE about SET content = ?, skills = ?, experience = ?, education = ?, plaintext = ?, certifications = ?',
                [htmlData, JSONskills, experience, education, textData,certifications]
            );
            res.json({ message: 'About bilgisi başarıyla güncellendi' });
        }
    } catch (error) {
        next(error);
    }
};

router.get('/', getAbout);
router.put('/',  verifyToken, isAdmin, updateAbout);

export default router; 
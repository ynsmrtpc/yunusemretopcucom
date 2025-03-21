import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const router = express.Router();

// ES modüllerde __dirname ve __filename oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Özel request tipleri
interface FileRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Yükleme klasörünü oluştur (eğer yoksa)
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadDir);
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// Dosya filtreleme (sadece resim dosyalarını kabul et)
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'));
  }
};

// Multer yükleme nesnesi
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Tekli resim yükleme endpoint'i
router.post('/single', upload.single('image'), (req: FileRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resim yüklenemedi' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      message: 'Resim başarıyla yüklendi',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    return res.status(500).json({ success: false, message: 'Resim yüklenirken bir hata oluştu' });
  }
});

// Çoklu resim yükleme endpoint'i
router.post('/multiple', upload.array('images', 10), (req: FileRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Resimler yüklenemedi' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    return res.status(200).json({
      success: true,
      message: 'Resimler başarıyla yüklendi',
      imageUrls: imageUrls
    });
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    return res.status(500).json({ success: false, message: 'Resimler yüklenirken bir hata oluştu' });
  }
});

export default router; 
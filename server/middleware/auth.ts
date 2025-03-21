import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface AuthRequest extends Request {
    cookies?: any;
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const generateToken = (user: { id: number; email: string; role: string }) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
    );
};

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: number;
            email: string;
            role: string;
        };

        // Kullanıcının hala var olduğunu kontrol et
        const [users] = await getDB().execute<RowDataPacket[]>(
            'SELECT id, email, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Geçersiz token' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
}; 
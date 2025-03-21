import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (requireAdmin && user?.role !== 'admin') {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate, requireAdmin]);

    if (!isAuthenticated) return null;
    if (requireAdmin && user?.role !== 'admin') return null;

    return <>{children}</>;
};

export default AuthGuard; 
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string, role: string) => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                isAuthenticated: false,

                login: async (email, password) => {
                    try {
                        const response = await authService.login({ email, password });
                        const { user } = response.data;
                        
                        if (!user) {
                            throw new Error('Invalid response from server');
                        }

                        set({ user, isAuthenticated: true });
                    } catch (error) {
                        console.error('Login error:', error);
                        throw error;
                    }
                },

                logout: async () => {
                    try {
                        await authService.logout();
                        set({ user: null, isAuthenticated: false });
                    } catch (error) {
                        console.error('Logout error:', error);
                        throw error;
                    }
                },

                register: async (name, email, password, role) => {
                    try {
                        await authService.register({ name, email, password, role });
                    } catch (error) {
                        console.error('Register error:', error);
                        throw error;
                    }
                },

                checkAuth: async () => {
                    try {
                        const response = await authService.me();
                        set({ user: response.data, isAuthenticated: true });
                    } catch (error) {
                        set({ user: null, isAuthenticated: false });
                        throw error;
                    }
                },
            }),
            { name: 'auth-store' }
        )
    )
); 
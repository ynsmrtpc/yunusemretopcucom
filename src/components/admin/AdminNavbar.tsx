import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/api.ts";
import { useAuthStore } from "@/store/useAuthStore";

export const AdminNavbar = () => {
    const navigate = useNavigate();
    const { user, logout: logoutStore } = useAuthStore();

    const logout = async () => {
        try {
            await authService.logout();
            await logoutStore();
            toast.success("Çıkış Yapıldı!");
            navigate("/login");
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Giriş yapılamadı!");
        }
    }

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-8">
                <Link to="/admin" className="font-bold text-xl">
                    Admin Panel
                </Link>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span>{user?.name || 'Kullanıcı'}</span>
                    </div>
                    <Button onClick={logout} variant="ghost" size="icon">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}; 
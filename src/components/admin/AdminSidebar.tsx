import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    User,
    Mail,
    Users,
    Home,
    Navigation,
    Layout,
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
    },
    {
        title: "Anasayfa",
        icon: Home,
        href: "/admin/home",
    },
    {
        title: "Blog Yazıları",
        icon: FileText,
        href: "/admin/blog",
    },
    {
        title: "Projeler",
        icon: Briefcase,
        href: "/admin/portfolio",
    },
    {
        title: "Hakkımda",
        icon: User,
        href: "/admin/about",
    },
    {
        title: "İletişim",
        icon: Mail,
        href: "/admin/contact",
    },
    {
        title: "Navbar Ayarları",
        icon: Navigation,
        href: "/admin/navbar",
    },
    {
        title: "Footer Ayarları",
        icon: Layout,
        href: "/admin/footer",
    },
    {
        title: "Kullanıcılar",
        icon: Users,
        href: "/admin/users",
    },
];

export const AdminSidebar = () => {
    const location = useLocation();

    return (
        <aside className="w-64 border-r min-h-[calc(100vh-4rem)] p-4">
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors",
                            location.pathname === item.href && "bg-secondary text-foreground"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}; 
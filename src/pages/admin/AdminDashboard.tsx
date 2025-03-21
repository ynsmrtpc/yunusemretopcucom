import {
    FileText,
    Briefcase,
    MessageSquare,
    Eye,
    ArrowUpRight,
    Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/api";
import { DashboardStats, RecentPost, RecentMessage } from "@/types/admin/types";
import { toast } from "sonner";

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
    const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
    const [loading, setLoading] = useState(true);

    const statsConfig = [
        {
            title: "Blog Yazıları",
            value: stats?.blogs || 0,
            icon: FileText,
            href: "/admin/blog",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Projeler",
            value: stats?.projects || 0,
            icon: Briefcase,
            href: "/admin/portfolio",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Mesajlar",
            value: stats?.messages || 0,
            icon: MessageSquare,
            href: "/admin/contact",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Toplam Görüntülenme",
            value: stats?.totalViews || 0,
            icon: Eye,
            href: "#",
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, postsRes, messagesRes] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getRecentPosts(),
                dashboardService.getRecentMessages(),
            ]);

            setStats(statsRes.data);
            setRecentPosts(postsRes.data);
            setRecentMessages(messagesRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Dashboard verileri alınamadı!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex gap-4">
                    <Link
                        to="/"
                        target="_blank"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        Siteyi Görüntüle
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat) => (
                    <Link
                        key={stat.title}
                        to={stat.href}
                        className="p-6 border rounded-lg hover:border-primary transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Son Blog Yazıları */}
                <div className="border rounded-lg">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Son Blog Yazıları</h2>
                            <Link
                                to="/admin/blog"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Tümünü Gör
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y">
                        {recentPosts.map((post) => (
                            <div key={post.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">{post.title}</h3>
                                        <p className="text-sm text-muted-foreground">{post.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm">{post.views}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Son Mesajlar */}
                <div className="border rounded-lg">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Son Mesajlar</h2>
                            <Link
                                to="/admin/contact"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Tümünü Gör
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y">
                        {recentMessages.map((message) => (
                            <div key={message.id} className="p-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{message.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {message.date}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {message.email}
                                    </p>
                                    <p className="text-sm line-clamp-1">{message.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
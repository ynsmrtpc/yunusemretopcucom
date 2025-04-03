import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/tables/DataTable";
import { BlogPost, blogColumns } from "@/components/admin/tables/columns";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";

// Blog durumları için filtre seçenekleri
const blogStatusOptions = [
    { label: "Yayında", value: "published" },
    { label: "Taslak", value: "draft" },
];

const AdminBlogList = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/blogs?limit=99999');
            setBlogs(response.data.blogs);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Blog yazıları alınamadı.");
            setLoading(false);
        }
    };

    const handleEdit = (blog: BlogPost) => {
        navigate(`/admin/blog/edit/${blog.slug}`);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/blogs/${id}`);
            toast.success("Blog yazısı başarıyla silindi");
            fetchBlogs();
        } catch (error) {
            console.error("Error deleting blog:", error);
            toast.error("Blog yazısı silinemedi");
        }
    };

    const columns = blogColumns(handleEdit, handleDelete);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between">
                <AdminPageTitle
                    title="Blog Yönetimi"
                    description="Sitenizin blog sayfasını özelleştirin"
                />
                <Link to="/admin/blog/edit">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Blog Yazısı
                    </Button>
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={blogs}
                searchKey="title"
                searchPlaceholder="Başlığa göre ara..."
                filterColumnKey="status"
                filterOptions={[
                    { label: "Yayında", value: "published" },
                    { label: "Taslak", value: "draft" },
                ]}
            />
        </section>
    );
};

export default AdminBlogList;

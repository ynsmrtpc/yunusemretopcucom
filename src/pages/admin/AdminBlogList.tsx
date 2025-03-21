import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { blogService } from "@/services/api";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/tables/DataTable";
import { BlogPost, blogColumns } from "@/components/admin/tables/columns";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";

const AdminBlogList = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await blogService.getAll();
            setBlogs(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Blog yazıları alınamadı.");
        }
    };

    const handleEdit = (blog: BlogPost) => {
        navigate(`/admin/blog/edit/${blog.slug}`);
    };

    const handleDelete = async (id: number) => {
        try {
            await blogService.delete(id.toString());
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
            />
        </section>
    );
};

export default AdminBlogList;

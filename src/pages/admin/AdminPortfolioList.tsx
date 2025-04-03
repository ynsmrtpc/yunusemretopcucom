import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/tables/DataTable";
import { Project, projectColumns } from "@/components/admin/tables/columns";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";

// Proje durumları için filtre seçenekleri
const projectStatusOptions = [
    { label: "Tamamlandı", value: "completed" },
    { label: "Devam Ediyor", value: "in_progress" },
];

const AdminPortfolioList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/projects?limit=9999');
            setProjects(response.data.projects);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Projeler alınamadı.");
            setLoading(false);
        }
    };

    const handleEdit = (project: Project) => {
        navigate(`/admin/portfolio/edit/${project.slug}`);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/projects/${id}`);
            toast.success("Proje başarıyla silindi");
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error("Proje silinemedi");
        }
    };

    const columns = projectColumns(handleEdit, handleDelete);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <AdminPageTitle
                    title="Projeler"
                    description="Sitenizin anasayfasını özelleştirin"
                />
                <Link to="/admin/portfolio/edit">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Proje
                    </Button>
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={projects}
                searchKey="title"
                searchPlaceholder="Başlığa göre ara..."
                filterColumnKey="status"
                filterOptions={projectStatusOptions}
            />
        </>
    );
};

export default AdminPortfolioList;
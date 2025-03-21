import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useModalStore } from "@/store/useModalStore";
import { toast } from "sonner";
import UserForm from "@/components/admin/forms/UserForm";
import { authService } from "@/services/api";
import { DataTable } from "@/components/admin/tables/DataTable";
import { User, userColumns } from "@/components/admin/tables/columns";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { openModal } = useModalStore();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authService.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Kullanıcılar alınamadı.");
        }
    };

    const handleAddUser = () => {
        openModal({
            title: "Yeni Kullanıcı Ekle",
            description: "Kullanıcı bilgilerini doldurun",
            view: <UserForm onSubmit={handleUserSubmit} />
        });
    };

    const handleUserSubmit = async (values: any) => {
        try {
            await authService.register(values);
            toast.success("Kullanıcı başarıyla eklendi");
            fetchUsers();
        } catch (error: any) {
            console.error("Error adding user:", error);
            toast.error(error.response?.data?.message || "Kullanıcı eklenemedi");
        }
    };

    const handleEditUser = (user: User) => {
        openModal({
            title: "Kullanıcı Düzenle",
            description: "Kullanıcı bilgilerini güncelleyin",
            view: <UserForm onSubmit={(values) => handleUserUpdate(user.id, values)} initialValues={user} />
        });
    };

    const handleUserUpdate = async (id: number, values: any) => {
        try {
            await authService.updateUser(id, values);
            toast.success("Kullanıcı başarıyla güncellendi");
            fetchUsers();
        } catch (error: any) {
            console.error("Error updating user:", error);
            toast.error(error.response?.data?.message || "Kullanıcı güncellenemedi");
        }
    };

    const handleDeleteUser = async (id: number) => {
        try {
            await authService.deleteUser(id);
            toast.success("Kullanıcı başarıyla silindi");
            fetchUsers();
        } catch (error: any) {
            console.error("Error deleting user:", error);
            toast.error(error.response?.data?.message || "Kullanıcı silinemedi");
        }
    };

    const columns = userColumns(handleEditUser, handleDeleteUser);

    if (users.length <= 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <AdminPageTitle
                    title="Kullanıcılar"
                    description="Kullanıcıları özelleştirin"
                />
                <Button onClick={handleAddUser}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kullanıcı
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                searchKey="name"
                searchPlaceholder="İsme göre ara..."
            />
        </div>
    );
};

export default AdminUsers; 
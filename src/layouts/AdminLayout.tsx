import { Outlet } from "react-router-dom";
import { AdminNavbar } from "../components/admin/AdminNavbar";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import SEO from "@/components/SEO";

export const AdminLayout = () => {
    return (
        <>
            <SEO
                title="Admin Panel"
                description="Site yönetim paneli"
                noindex={true}
            />
            <div className="min-h-screen bg-background">
                <AdminNavbar />
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}; 
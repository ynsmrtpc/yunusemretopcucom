import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await login(email, password);
            toast.success("Giriş başarılı!");
            navigate("/admin");
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Giriş yapılamadı!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SEO
                title="Admin Girişi"
                description="Admin paneli giriş sayfası"
                noindex={true}
            />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                    <div>
                        <h2 className="text-center text-3xl font-bold">Admin Girişi</h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Şifre
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
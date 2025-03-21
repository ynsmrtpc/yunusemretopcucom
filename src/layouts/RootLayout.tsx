import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import Modal from '../components/Modal';

export const RootLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <Modal />
        </div>
    );
}; 
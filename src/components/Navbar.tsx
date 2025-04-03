import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { navbarService } from "../services/api";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Search } from "lucide-react";
import SearchOverlay from "./SearchOverlay";

interface NavbarData {
    site_title: string;
    logo?: string;
    navigation_links: {
        id: number;
        title: string;
        url: string;
    }[];
}

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [data, setData] = useState<NavbarData | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchNavbarData = async () => {
            try {
                const { data } = await navbarService.get();
                setData(data);
            } catch (err) {
                console.error('Navbar içeriği yüklenirken bir hata oluştu:' + err);
            }
        };

        fetchNavbarData();
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    // Varsayılan navigasyon linkleri (API'den veri gelmezse)
    const defaultNavLinks = [
        { id: 1, title: "Blog", url: "/blog" },
        { id: 2, title: "Portfolio", url: "/portfolio" },
        { id: 3, title: "Hakkımda", url: "/about" },
        { id: 4, title: "İletişim", url: "/contact" }
    ];

    const navLinks = data?.navigation_links?.length ? data.navigation_links : defaultNavLinks;
    const siteTitle = data?.site_title || "Portfolio";

    const handleSearchOpen = () => {
        setIsSearchOpen(true);
    };

    const handleSearchClose = () => {
        setIsSearchOpen(false);
    };

    return (
        <>
            <nav
                className={`sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isScrolled ? "shadow-sm" : ""
                    }`}
            >
                <div className="container flex h-16 items-center">
                    <Link
                        to="/"
                        className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                    >
                        {data?.logo ? (
                            <img src={data.logo} alt={siteTitle} className="h-8" />
                        ) : (
                            siteTitle
                        )}
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center ml-auto gap-1">
                        {navLinks.map((link) => (
                            <Link key={link.id} to={link.url}>
                                <Button
                                    variant={isActive(link.url) ? "default" : "ghost"}
                                    className="rounded-full"
                                >
                                    {link.title}
                                </Button>
                            </Link>
                        ))}
                        {/* Desktop Arama Butonu */}
                        <Button variant="ghost" size="icon" onClick={handleSearchOpen} className="ml-2">
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Ara</span>
                        </Button>
                    </div>

                    {/* Mobile Menu & Arama Butonu */}
                    <div className="md:hidden flex items-center ml-auto">
                        {/* Mobile Arama Butonu */}
                        <Button variant="ghost" size="icon" onClick={handleSearchOpen} className="mr-2">
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Ara</span>
                        </Button>
                        {/* Mobile Menu Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" className="p-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                                <div className="flex flex-col gap-4 mt-8">
                                    {navLinks.map((link) => (
                                        <Link key={link.id} to={link.url}>
                                            <Button
                                                variant={isActive(link.url) ? "default" : "ghost"}
                                                className="w-full justify-start"
                                            >
                                                <>
                                                    {link.title}
                                                </>
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>

            {/* Arama Overlay */}
            {isSearchOpen && <SearchOverlay onClose={handleSearchClose} />}
        </>
    );
}; 
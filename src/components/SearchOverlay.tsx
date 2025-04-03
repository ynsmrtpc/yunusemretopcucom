import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface SearchOverlayProps {
    onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Otomatik focus ve Escape ile kapatma
    useEffect(() => {
        inputRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Arka plana tıklayınca kapatma
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (overlayRef.current === event.target) {
            onClose();
        }
    };

    // Form submit edildiğinde arama sayfasına yönlendirme
    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            onClose(); // Yönlendirme sonrası overlay'i kapat
        }
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-[15vh] md:pt-[20vh]"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-xl bg-background rounded-lg shadow-2xl p-1">
                {/* Kapatma Butonu */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Kapat</span>
                </Button>

                {/* Arama Formu */}
                <form onSubmit={handleSearchSubmit} className="flex items-center w-full p-4">
                    <Search className="h-5 w-5 mr-3 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="search"
                        placeholder="Sitede ara... (Blog, Proje)"
                        className="flex-grow text-lg border-none focus-visible:ring-0 shadow-none p-0 h-auto bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>
        </div>
    );
};

export default SearchOverlay;
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

const Lightbox: React.FC<LightboxProps> = ({
    images,
    currentIndex,
    onClose,
    onNavigate
}) => {
    const [isLoading, setIsLoading] = useState(true);

    // ESC tuşu ile kapatma
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, onClose]);

    // Önceki resme git
    const handlePrev = () => {
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        onNavigate(prevIndex);
        setIsLoading(true);
    };

    // Sonraki resme git
    const handleNext = () => {
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        onNavigate(nextIndex);
        setIsLoading(true);
    };

    // Resim yüklendiğinde
    const handleImageLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            {/* Kapatma butonu */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
                onClick={onClose}
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Önceki resim butonu */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20 z-50"
                onClick={handlePrev}
            >
                <ChevronLeft className="h-8 w-8" />
            </Button>

            {/* Sonraki resim butonu */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20 z-50"
                onClick={handleNext}
            >
                <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Resim */}
            <div className="relative w-full h-full flex items-center justify-center p-10">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <img
                    src={images[currentIndex]}
                    alt={`Resim ${currentIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                    onLoad={handleImageLoad}
                />
            </div>

            {/* Resim sayacı */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export default Lightbox; 
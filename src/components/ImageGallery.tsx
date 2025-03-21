import React, { useState } from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Lightbox from './Lightbox';

interface ImageGalleryProps {
    images: string[];
    title?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const navigateImage = (index: number) => {
        setCurrentImageIndex(index);
    };

    return (
        <div className="w-full py-8">
            {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
            <Carousel className="w-full max-w-5xl mx-auto">
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                        <div className="relative w-full h-full overflow-hidden rounded-md group">
                                            <img
                                                src={image}
                                                alt={`Galeri resmi ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                                                onClick={() => openLightbox(index)}
                                            />
                                            <div
                                                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                onClick={() => openLightbox(index)}
                                            >
                                                <span className="text-white font-medium">Büyüt</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>

            {/* Lightbox */}
            {lightboxOpen && (
                <Lightbox
                    images={images}
                    currentIndex={currentImageIndex}
                    onClose={closeLightbox}
                    onNavigate={navigateImage}
                />
            )}
        </div>
    );
};

export default ImageGallery;
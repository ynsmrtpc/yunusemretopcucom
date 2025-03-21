import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
    currentImage?: string | null;
    onUpload: (file: File) => void;
    onRemove?: () => void;
}

export const ImageUpload = ({ currentImage, onUpload, onRemove }: ImageUploadProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dosya önizlemesi oluştur
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Dosyayı yükle
        onUpload(file);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Görsel kaldırıldığında ana bileşene bildir
        if (onRemove) {
            onRemove();
        }
    };

    return (
        <div className="space-y-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {previewUrl ? (
                <div className="relative">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 rounded-md object-contain border"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="border border-dashed rounded-md p-8 text-center">
                    <p className="text-muted-foreground mb-2">Görsel yüklemek için tıklayın</p>
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
                className="w-full"
            >
                <Upload className="w-4 h-4 mr-2" />
                {previewUrl ? 'Görseli Değiştir' : 'Görsel Yükle'}
            </Button>
        </div>
    );
}; 
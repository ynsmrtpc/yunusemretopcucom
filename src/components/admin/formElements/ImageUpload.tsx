import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X, Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import axios from "axios";
import { toast } from "sonner";

interface ImageUploadProps {
    label: string;
    name: string;
    multiple?: boolean;
    value?: string | string[];
    onChange: (name: string, value: string | string[] | File | File[]) => void;
    className?: string;
    required?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    name,
    multiple = false,
    value,
    onChange,
    className,
    required = false,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.7,
}) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [tempFiles, setTempFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (value) {
            if (multiple && Array.isArray(value) && typeof value[0] === "string") {
                setPreviewUrls(value as string[]);
            } else if (!multiple && typeof value === "string" && value) {
                setPreviewUrls([value]);
            }
        } else {
            setPreviewUrls([]);
        }
    }, [value, multiple]);

    // Resim sıkıştırma fonksiyonu
    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    // Orijinal boyutlar
                    let width = img.width;
                    let height = img.height;

                    // Maksimum boyutları aşıyorsa, oranları koruyarak yeniden boyutlandır
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = width * ratio;
                        height = height * ratio;
                    }

                    // Canvas oluştur ve resmi çiz
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas context oluşturulamadı'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Sıkıştırılmış resmi blob olarak al
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Blob oluşturulamadı'));
                                return;
                            }

                            // Yeni bir File nesnesi oluştur
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });

                            resolve(compressedFile);
                        },
                        'image/jpeg',
                        quality
                    );
                };

                img.onerror = () => {
                    reject(new Error('Resim yüklenemedi'));
                };
            };

            reader.onerror = () => {
                reject(new Error('Dosya okunamadı'));
            };
        });
    };

    // Dosya seçildiğinde çalışacak fonksiyon
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);

        try {
            const filesToProcess = Array.from(files);
            const compressedFiles: File[] = [];
            const newPreviewUrls: string[] = [];

            // Her dosyayı sıkıştır ve önizleme URL'si oluştur
            for (const file of filesToProcess) {
                const compressedFile = await compressImage(file);
                compressedFiles.push(compressedFile);

                // Önizleme URL'si oluştur
                const previewUrl = URL.createObjectURL(compressedFile);
                newPreviewUrls.push(previewUrl);
            }

            // State'i güncelle
            if (multiple) {
                // Çoklu resim yükleme
                const updatedTempFiles = [...tempFiles, ...compressedFiles];
                setTempFiles(updatedTempFiles);
                setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
                onChange(name, updatedTempFiles);
            } else {
                // Tekli resim yükleme
                setTempFiles([compressedFiles[0]]);
                setPreviewUrls([newPreviewUrls[0]]);
                onChange(name, compressedFiles[0]);
            }

            toast.success(multiple ? 'Resimler başarıyla eklendi' : 'Resim başarıyla eklendi');
        } catch (error) {
            console.error("Resim işleme hatası:", error);
            toast.error(error instanceof Error ? error.message : 'Resim işleme başarısız');
        } finally {
            setIsLoading(false);
            // Input değerini sıfırla (aynı dosyayı tekrar seçebilmek için)
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const newPreviewUrls = [...previewUrls];
        newPreviewUrls.splice(index, 1);
        setPreviewUrls(newPreviewUrls);

        // Eğer geçici dosya ise, onu da kaldır
        if (tempFiles.length > 0) {
            const newTempFiles = [...tempFiles];
            newTempFiles.splice(index, 1);
            setTempFiles(newTempFiles);

            if (multiple) {
                onChange(name, newTempFiles);
            } else {
                onChange(name, newTempFiles[0] || "");
            }
        } else {
            // Eğer zaten kaydedilmiş bir URL ise
            if (multiple && Array.isArray(value)) {
                const newValue = (value as string[]).filter((_, i) => i !== index);
                onChange(name, newValue);
            } else {
                onChange(name, "");
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            </div>

            <div className="flex flex-col gap-4">
                {/* Resim Önizleme Alanı */}
                {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {previewUrls.map((url, index) => (
                            <div
                                key={index}
                                className="relative group aspect-square border rounded-md overflow-hidden"
                            >
                                <img
                                    src={url}
                                    alt={`Preview ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Yükleme Butonu */}
                <div>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleButtonClick}
                        className="w-full border-dashed flex flex-col items-center justify-center gap-2  py-24"
                        disabled={isLoading}
                    >
                        <div className="rounded-full bg-primary/10 p-2">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : previewUrls.length === 0 ? (
                                <ImagePlus className="w-5 h-5 text-primary" />
                            ) : (
                                <Upload className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-medium">
                                {isLoading ? "Resimler İşleniyor..." : multiple
                                    ? "Resimleri Eklemek İçin Tıklayın"
                                    : "Resim Eklemek İçin Tıklayın"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                PNG, JPG veya GIF (max. 5MB)
                            </span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;
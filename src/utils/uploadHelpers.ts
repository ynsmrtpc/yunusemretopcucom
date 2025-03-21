import axios from 'axios';
import { uploadService } from '@/services/api';

/**
 * Dosyaları sunucuya yükler
 * @param files Yüklenecek dosyalar
 * @returns Yüklenen dosyaların URL'leri
 */
export const uploadFiles = async (files: File | File[]): Promise<string | string[]> => {
    try {
        if (Array.isArray(files)) {
            // Çoklu dosya yükleme
            if (files.length === 0) return [];
            
            const response = await uploadService.uploadMultiple(files);

            if (response.data.success) {
                return response.data.imageUrls;
            } else {
                throw new Error(response.data.message || 'Resimler yüklenemedi');
            }
        } else {
            // Tekli dosya yükleme
            const response = await uploadService.uploadSingle(files);

            if (response.data.success) {
                return response.data.imageUrl;
            } else {
                throw new Error(response.data.message || 'Resim yüklenemedi');
            }
        }
    } catch (error) {
        console.error('Sunucuya yükleme hatası:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Sunucuya yükleme başarısız');
        }
        throw new Error('Sunucuya yükleme başarısız');
    }
};

/**
 * Form değerlerindeki dosyaları yükler ve URL'leri ile değiştirir
 * @param values Form değerleri
 * @returns URL'ler ile güncellenmiş form değerleri
 */
export const processFormImages = async <T extends Record<string, any>>(values: T): Promise<T> => {
    const newValues = { ...values };
    const uploadPromises: Promise<void>[] = [];

    // Form alanlarını kontrol et ve dosya varsa yükle
    for (const key in newValues) {
        const value = newValues[key];
        
        // Tekli dosya kontrolü
        if (value && typeof value === 'object' && 'name' in value && 'type' in value && 'size' in value) {
            uploadPromises.push(
                uploadFiles(value as File)
                    .then((url) => {
                        // Type assertion kullanarak tip uyumsuzluğunu çözüyoruz
                        newValues[key] = url as any;
                    })
            );
        }
        // Çoklu dosya kontrolü
        else if (Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === 'object' && 'name' in value[0]) {
            uploadPromises.push(
                uploadFiles(value as File[])
                    .then((urls) => {
                        // Type assertion kullanarak tip uyumsuzluğunu çözüyoruz
                        newValues[key] = urls as any;
                    })
            );
        }
    }

    // Tüm yükleme işlemlerinin tamamlanmasını bekle
    if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
    }

    return newValues;
}; 
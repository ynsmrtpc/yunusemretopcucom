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

    for (const key in newValues) {
        const value = newValues[key];

        // Çoklu dosya kontrolü
        if (Array.isArray(value) && value.length > 0) {
            // Sadece File olanları upload et, string olanları bırak
            const filesToUpload = value.filter((v: any) => typeof v === 'object' && 'name' in v);
            const stringsToKeep = value.filter((v: any) => typeof v === 'string');
            if (filesToUpload.length > 0) {
                uploadPromises.push(
                    uploadFiles(filesToUpload as File[])
                        .then((urls) => {
                            // Hem eski stringler hem yeni yüklenenler birleştirilsin
                            newValues[key] = [...stringsToKeep, ...(Array.isArray(urls) ? urls : [urls])] as any;
                        })
                );
            } else {
                newValues[key] = stringsToKeep as any;
            }
        }
        // Tekli dosya kontrolü
        else if (value && typeof value === 'object' && 'name' in value && 'type' in value && 'size' in value) {
            uploadPromises.push(
                uploadFiles(value as File)
                    .then((url) => {
                        newValues[key] = url as any;
                    })
            );
        }
    }

    if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
    }

    return newValues;
}; 
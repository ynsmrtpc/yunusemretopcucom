# Kişisel Blog ve Portföy Sitesi

## Proje Hakkında
Bu proje, modern web teknolojileri kullanılarak geliştirilmiş bir kişisel blog ve portföy sitesidir. React, TypeScript ve Vite kullanılarak oluşturulmuştur.

## Kullanılan Teknolojiler
- Frontend:
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Axios
  - React Hook Form
  - Zod (Form validasyonu için)
  - Shadcn/ui (UI Bileşenleri için)
  - Lucide React (İkonlar için)
  - TipTap (Zengin metin editörü için)

- Backend:
  - Node.js
  - Express
  - MySQL2
  - JWT (Authentication için)

## Başlangıç

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- MySQL

### Kurulum
1. Projeyi klonlayın:
```bash
git clone [repo-url]
```

2. Frontend bağımlılıklarını yükleyin:
```bash
cd [proje-klasörü]
npm install
```

3. Backend bağımlılıklarını yükleyin:
```bash
cd server
npm install
```

4. Veritabanını kurun:
```bash
cd server
npm run db:setup
```

5. `.env` dosyasını oluşturun:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=portfolio
JWT_SECRET=your_secret_key
```

6. Uygulamayı başlatın:
```bash
# Frontend için
npm run dev

# Backend için (yeni terminal)
cd server
npm run dev
```

## Proje Yapısı
```
├── src/
│   ├── components/     # Yeniden kullanılabilir bileşenler
│   │   ├── ui/        # Shadcn UI bileşenleri
│   │   ├── admin/     # Admin panel bileşenleri
│   │   └── forms/     # Form bileşenleri
│   ├── pages/         # Sayfa bileşenleri
│   ├── services/      # API servisleri
│   ├── layouts/       # Sayfa düzenleri
│   ├── utils/         # Yardımcı fonksiyonlar
│   ├── store/         # Global state yönetimi
│   └── types/         # TypeScript tip tanımlamaları
│
└── server/
    ├── config/        # Veritabanı ve diğer yapılandırmalar
    ├── routes/        # API route'ları
    ├── middleware/    # Express middleware'leri
    └── types/         # TypeScript tip tanımlamaları
```

## Özellikler

### Admin Paneli
1. Dashboard:
   - Blog, proje ve mesaj istatistikleri
   - Toplam görüntülenme sayısı
   - Son blog yazıları
   - Son gelen mesajlar

2. Blog Yönetimi:
   - Blog yazılarını listeleme
   - Yeni blog yazısı ekleme
   - Blog yazılarını düzenleme
   - Blog yazılarını silme

3. Proje Yönetimi:
   - Projeleri listeleme
   - Yeni proje ekleme
   - Projeleri düzenleme
   - Projeleri silme

4. Hakkımda Sayfası Yönetimi:
   - İçerik düzenleme
   - Deneyim ekleme/düzenleme/silme
   - Eğitim ekleme/düzenleme/silme
   - Sertifika ekleme/düzenleme/silme
   - Yetenekler listesi düzenleme

5. İletişim Yönetimi:
   - İletişim bilgilerini düzenleme
   - Gelen mesajları görüntüleme
   - Mesajları silme

6. Anasayfa Yönetimi:
   - Hero bölümü düzenleme
   - Hakkımda bölümü düzenleme
   - Servisler bölümü düzenleme

7. Footer Yönetimi:
   - Logo ve açıklama düzenleme
   - Navigasyon linkleri düzenleme
   - Sosyal medya linkleri düzenleme
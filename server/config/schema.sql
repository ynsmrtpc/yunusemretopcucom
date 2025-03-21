-- Blog tablosu
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    plaintext TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    views INT DEFAULT 0,
    excerpt TEXT,
    status ENUM('published', 'draft') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projeler tablosu
CREATE TABLE IF NOT EXISTS projects (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  category varchar(100) NOT NULL,
  technologies json NOT NULL,
  plaintext TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  status enum('completed','in_progress') DEFAULT 'in_progress',
  client varchar(255) DEFAULT NULL,
  duration varchar(100) DEFAULT NULL,
  year int DEFAULT NULL,
  live_url varchar(255) DEFAULT NULL,
  github_url varchar(255) DEFAULT NULL,
  views INT DEFAULT 0,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Proje görselleri tablosu
CREATE TABLE IF NOT EXISTS project_images (
  id int NOT NULL AUTO_INCREMENT,
  project_id int NOT NULL,
  image_url varchar(255) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  type enum('cover','gallery') DEFAULT 'gallery',
  PRIMARY KEY (id),
  KEY project_id (project_id),
  CONSTRAINT project_images_ibfk_1 FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Blog görselleri tablosu
CREATE TABLE IF NOT EXISTS blog_images (
  id int NOT NULL AUTO_INCREMENT,
  blog_id int NOT NULL,
  image_url varchar(255) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  type enum('cover','gallery') DEFAULT 'gallery',
  PRIMARY KEY (id),
  KEY blog_id (blog_id),
  CONSTRAINT blog_images_ibfk_1 FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Hakkımda tablosu
CREATE TABLE IF NOT EXISTS about (
  id int NOT NULL AUTO_INCREMENT,
  content text NOT NULL,
  skills json NOT NULL,
  plaintext text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  experience json NOT NULL,
  education json NOT NULL,
  certifications json NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- İletişim tablosu
CREATE TABLE IF NOT EXISTS contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact Messages tablosu
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Anasayfa tablosu
CREATE TABLE IF NOT EXISTS home (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hero_title VARCHAR(255) NOT NULL,
    hero_subtitle TEXT,
    hero_image VARCHAR(255),
    about_section_title VARCHAR(255),
    about_section_content TEXT,
    about_section_image VARCHAR(255),
    services_section_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Servisler tablosu
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Footer tablosu
CREATE TABLE IF NOT EXISTS footer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo VARCHAR(255),
    description TEXT,
    copyright_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Footer Navigation Links tablosu
CREATE TABLE IF NOT EXISTS footer_navigation_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Footer Social Links tablosu
CREATE TABLE IF NOT EXISTS footer_social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Navbar tablosu
CREATE TABLE IF NOT EXISTS navbar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_title VARCHAR(255) NOT NULL,
    logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Navbar Navigation Links tablosu
CREATE TABLE IF NOT EXISTS navbar_navigation_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

--
-- -- Örnek iletişim bilgileri
-- INSERT INTO contact (email, phone, address, github_url, linkedin_url, twitter_url, instagram_url)
-- VALUES (
--     'info@example.com',
--     '+90 555 123 4567',
--     'İstanbul, Türkiye',
--     'https://github.com/example',
--     'https://linkedin.com/in/example',
--     'https://twitter.com/example',
--     'https://instagram.com/example'
-- ) ON DUPLICATE KEY UPDATE
--     email = VALUES(email),
--     phone = VALUES(phone),
--     address = VALUES(address),
--     github_url = VALUES(github_url),
--     linkedin_url = VALUES(linkedin_url),
--     twitter_url = VALUES(twitter_url),
--     instagram_url = VALUES(instagram_url);
--
-- -- Örnek anasayfa içeriği
-- INSERT INTO home (hero_title, hero_subtitle, hero_image, about_section_title, about_section_content, services_section_title)
-- VALUES (
--     'Merhaba, Ben [İsim Soyisim]',
--     'Full Stack Web Developer',
--     '/images/hero.jpg',
--     'Hakkımda',
--     'Ben deneyimli bir Full Stack Web Developer''ım. Modern web teknolojileri kullanarak kullanıcı dostu ve ölçeklenebilir web uygulamaları geliştiriyorum.',
--     'Hizmetlerim'
-- ) ON DUPLICATE KEY UPDATE
--     hero_title = VALUES(hero_title),
--     hero_subtitle = VALUES(hero_subtitle),
--     hero_image = VALUES(hero_image),
--     about_section_title = VALUES(about_section_title),
--     about_section_content = VALUES(about_section_content),
--     services_section_title = VALUES(services_section_title);
--
-- -- Örnek servisler
-- INSERT INTO services (title, description, icon) VALUES
--     ('Web Geliştirme', 'Modern ve responsive web siteleri geliştiriyorum.', 'code'),
--     ('Mobil Uyumluluk', 'Tüm cihazlarda sorunsuz çalışan web uygulamaları.', 'devices'),
--     ('API Geliştirme', 'RESTful API tasarımı ve implementasyonu.', 'api')
-- ON DUPLICATE KEY UPDATE
--     title = VALUES(title),
--     description = VALUES(description),
--     icon = VALUES(icon);
--
-- -- Örnek footer içeriği
-- INSERT INTO footer (logo, description, copyright_text)
-- VALUES (
--     '/images/logo.png',
--     'Modern web teknolojileri kullanarak kullanıcı dostu ve ölçeklenebilir web uygulamaları geliştiriyorum.',
--     '© 2024 Tüm hakları saklıdır.'
-- ) ON DUPLICATE KEY UPDATE
--     logo = VALUES(logo),
--     description = VALUES(description),
--     copyright_text = VALUES(copyright_text);
--
-- -- Örnek footer navigation links
-- INSERT INTO footer_navigation_links (title, url) VALUES
--     ('Blog', '/blog'),
--     ('Portfolio', '/portfolio'),
--     ('Hakkımda', '/about'),
--     ('İletişim', '/contact')
-- ON DUPLICATE KEY UPDATE
--     title = VALUES(title),
--     url = VALUES(url);
--
-- -- Örnek footer social links
-- INSERT INTO footer_social_links (platform, url, icon) VALUES
--     ('GitHub', 'https://github.com/example', 'github'),
--     ('LinkedIn', 'https://linkedin.com/in/example', 'linkedin'),
--     ('Twitter', 'https://twitter.com/example', 'twitter')
-- ON DUPLICATE KEY UPDATE
--     platform = VALUES(platform),
--     url = VALUES(url),
--     icon = VALUES(icon);
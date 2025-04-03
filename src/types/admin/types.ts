export interface BlogList {
    id: string;
    title: string;
    content: string;
    image: string;
    excerpt: string;
    status: string;
    views: number;
    created_at: Date;
    slug:string;
    coverImage: string;
}

export interface BlogPost {
    title: string;
    content: string;
    image: string;
    excerpt: string;
    status: string;
    plaintext : string;
    coverImage?: string;
    galleryImages?: string[];
    views?: number;
}

export interface ProjectList {
    id:string;
    title: string;
    description: string;
    content: string;
    category: string;
    technologies: Array<string>;
    status: "completed" | "in_progress";
    client: string;
    duration: string;
    year: string;
    live_url: string;
    coverImage?:string;
    image?:string;
    github_url: string;
    images: string[];
    views: number;
    slug: string;
    plaintext: string;
}

export interface ProjectPost {
    title: string;
    description: string;
    category: string;
    technologies: Array<string>;
    status: "completed" | "in_progress";
    client: string;
    duration: string;
    year: string;
    live_url: string;
    github_url: string;
    content: string;
    plaintext:string;
    coverImage?: string;
    galleryImages?: string[];
    slug?: string;
    created_at?: string;
    views?: number;
}

export interface Experience {
    company: string;
    position: string;
    duration: string;
    description: string;
}

export interface Education {
    school: string;
    degree: string;
    duration: string;
    description?: string;
}

export interface Certification {
    name: string;
    issuer: string;
    year: string;
    url?: string;
}

export interface AboutData {
    content: string;
    plaintext: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    certifications: Certification[];
}

export interface ContactData {
    email: string;
    phone: string;
    address: string;
    github_url: string;
    linkedin_url: string;
    twitter_url: string;
    instagram_url: string;
    messages?: Array<Message>;
}

export interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    blogs: number;
    projects: number;
    messages: number;
    totalViews: number;
}

export interface RecentPost {
    id: string;
    title: string;
    date: string;
    views: number;
}

export interface RecentMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    date: string;
}


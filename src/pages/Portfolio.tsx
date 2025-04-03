import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { PortfolioSkeleton } from '@/components/skeletons/PortfolioSkeleton';
import { ProjectList as Project } from '@/types/admin/types';

const Portfolio = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await projectService.getAll();
            setProjects(data);
        } catch (err: any) {
            setError('Projeler yüklenirken bir hata oluştu: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PortfolioSkeleton />;
    }

    if (error) {
        return (
            <div className="container py-12 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Portfolio | Projelerim"
                description="Web geliştirme, mobil uygulama ve yazılım projelerim"
                keywords="portfolio, projeler, web geliştirme, mobil uygulama, yazılım"
                canonical="/portfolio"
            />
            <div className="container py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-12">Projelerim</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-xl transition-shadow flex flex-col justify-between w-full">
                                {(project.coverImage || project.image) && (
                                    <img
                                        src={project.coverImage || project.image}
                                        alt={project.title}
                                        className="w-full h-48 object-cover border"
                                    />
                                )}
                                <CardHeader>
                                    <CardTitle className="text-xl">{project.title}</CardTitle>
                                    <CardDescription>
                                        {project.category} • {project.year}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 flex-1">
                                    <p className="text-gray-700">{project.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.technologies.map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs font-medium"
                                            >
                                                {tech.trim()}
                                            </span>
                                        ))}
                                    </div>

                                </CardContent>
                                <CardFooter className="flex flex-wrap gap-2 justify-between">
                                    <div className="flex gap-2">
                                        {project.github_url && (
                                            <Button asChild variant="outline">
                                                <a
                                                    href={project.github_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    GitHub
                                                </a>
                                            </Button>
                                        )}
                                        {project.live_url && (
                                            <Button asChild variant="outline">
                                                <a
                                                    href={project.live_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Canlı Demo
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                    <Link to={`/portfolio/${project.slug}`} className="ml-auto">
                                        <Button variant="default">Detayları Gör</Button>
                                    </Link>

                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Portfolio;

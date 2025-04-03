import { Key, useEffect, useState } from 'react';
import { aboutService } from '../services/api';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { AboutSkeleton } from '@/components/skeletons/AboutSkeleton';

interface AboutExperience {
    company: string;
    duration: string;
    position: string;
    description: string;
}

interface AboutEducation {
    degree: string;
    school: string;
    duration: string;
}
interface AboutCertification {
    url: string;
    name: string;
    year: string;
    issuer: string;
}

interface About {
    id: number;
    title: string;
    content: string;
    image: string;
    skills: Array<string>;
    experience: Array<AboutExperience>;
    education: Array<AboutEducation>;
    certifications: Array<AboutCertification>;
}

const About = () => {
    const [about, setAbout] = useState<About | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const { data } = await aboutService.get();
                setAbout(data);
                setLoading(false);
            } catch (err) {
                setError('Bilgiler yüklenirken bir hata oluştu:' + err);
                setLoading(false);
            }
        };

        fetchAbout();
    }, []);

    if (loading) {
        return <AboutSkeleton />;
    }

    if (error || !about) {
        return (
            <div className="container py-12">
                <p className="text-red-500">{error || "Bilgiler bulunamadı."}</p>
            </div>
        );
    }

    // HTML içeriğinden metin çıkarma (SEO açıklaması için)
    const getTextFromHtml = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const description = getTextFromHtml(about.content).substring(0, 160);
    const keywords = about.skills ? about.skills.join(', ') : 'hakkımda, özgeçmiş, yetenekler';
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.yunusemretopcu.com';

    // Schema.org için yapısal veri
    const schemaData = {
        name: 'Site Sahibi',
        description: description,
        image: about.image,
        jobTitle: about.experience && about.experience.length > 0 ? about.experience[0].position : 'Web Geliştirici',
        url: `${siteUrl}/about`,
        sameAs: [
            'https://github.com/ynsmrtpc',
            'https://linkedin.com/in/yunusemretopcu',
            'https://twitter.com/ynsmrtpc'
        ],
        worksFor: about.experience && about.experience.length > 0 ? {
            '@type': 'Organization',
            name: about.experience[0].company
        } : undefined,
        alumniOf: about.education && about.education.length > 0 ? {
            '@type': 'EducationalOrganization',
            name: about.education[0].school
        } : undefined,
        knowsAbout: about.skills
    };

    return (
        <>
            <SEO
                title="Hakkımda | Portfolio"
                description={description}
                keywords={keywords}
                ogImage={about.image}
                canonical="/about"
                schemaType="Person"
                schemaData={schemaData}
            />
            <div className="container py-12">
                <div className="max-w-6xl mx-auto">
                    {/*  <h1 className="text-4xl font-bold mb-8">Hakkımda</h1> */}

                    {/* Ana İçerik */}
                    <div className="prose prose-lg mb-12" dangerouslySetInnerHTML={{ __html: about.content }} />

                    {/* Yetenekler */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">Yetenekler</h2>
                        <div className="flex flex-wrap gap-2">
                            {about.skills && about.skills.map((skill: string, i: Key | null | undefined) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                                >
                                    {skill.trim()}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/*<pre>*/}
                    {/*    {JSON.stringify(about, null, 2)}*/}
                    {/*</pre>*/}

                    {/* Deneyim */}
                    {about.experience && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Deneyim</h2>
                            <div className="space-y-4">
                                {about.experience.map((exp, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">{exp.company}</h3>
                                            <span className="text-sm text-muted-foreground">
                                                {exp.duration}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {exp.position}
                                        </p>
                                        <p className="text-sm">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Eğitim */}
                    {about.education && (
                        <section className='mb-12'>
                            <h2 className="text-2xl font-bold mb-4">Eğitim</h2>
                            <div className="space-y-4">
                                {about.education.map((edu, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">{edu.school}</h3>
                                            <span className="text-sm text-muted-foreground">
                                                {edu.duration}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {edu.degree}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    {about.certifications.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Sertifikalar</h2>
                            <div className="space-y-4">
                                {about.certifications.map((cert, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">{cert.name}</h3>
                                            <span className="text-sm text-muted-foreground ">
                                                {cert.year} <br />
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {cert.issuer}
                                            </p>
                                            <Link to={cert.url} target='_blank' className="text-sm text-blue-600">
                                                Sertifikayı Göster
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </>
    );
};

export default About; 
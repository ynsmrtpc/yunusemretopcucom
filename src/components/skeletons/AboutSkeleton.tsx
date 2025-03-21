import { Skeleton } from "@/components/ui/skeleton";

export const AboutSkeleton = () => {
    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto">
                {/* Başlık */}
                <Skeleton className="h-10 w-48 mb-8" />

                {/* Ana İçerik */}
                <div className="space-y-4 mb-12">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                </div>

                {/* Yetenekler */}
                <section className="mb-12">
                    <Skeleton className="h-8 w-36 mb-4" />
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-28 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-32 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                </section>

                {/* Deneyim */}
                <section className="mb-12">
                    <Skeleton className="h-8 w-36 mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Eğitim */}
                <section className="mb-12">
                    <Skeleton className="h-8 w-36 mb-4" />
                    <div className="space-y-4">
                        {[1, 2].map((_, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-40" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sertifikalar */}
                <section>
                    <Skeleton className="h-8 w-36 mb-4" />
                    <div className="space-y-4">
                        {[1, 2].map((_, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}; 
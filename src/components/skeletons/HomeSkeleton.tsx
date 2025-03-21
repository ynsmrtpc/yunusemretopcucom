import { Skeleton } from "@/components/ui/skeleton";

export const HomeSkeleton = () => {
    return (
        <div>
            {/* Hero Section Skeleton */}
            <section className="relative py-20 overflow-hidden">
                <div className="container relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
                        <Skeleton className="h-6 w-full mx-auto mb-2" />
                        <Skeleton className="h-6 w-5/6 mx-auto mb-8" />
                        <div className="flex gap-4 justify-center">
                            <Skeleton className="h-12 w-40 rounded-full" />
                            <Skeleton className="h-12 w-40 rounded-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section Skeleton */}
            <section className="py-20">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <Skeleton className="aspect-video rounded-lg" />
                        <div>
                            <Skeleton className="h-10 w-48 mb-6" />
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-4/5" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section Skeleton */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <Skeleton className="h-10 w-64 mx-auto mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-background p-8 rounded-lg border">
                                <Skeleton className="w-12 h-12 rounded-lg mb-6" />
                                <Skeleton className="h-6 w-40 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Projects Skeleton */}
            <section className="py-20">
                <div className="container">
                    <Skeleton className="h-10 w-64 mx-auto mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group relative overflow-hidden rounded-lg border bg-background">
                                <Skeleton className="aspect-video w-full" />
                                <div className="p-6">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-full mb-4" />
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-6 w-14 rounded-full" />
                                    </div>
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Blog Posts Skeleton */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <Skeleton className="h-10 w-64 mx-auto mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-background rounded-lg border overflow-hidden">
                                <Skeleton className="aspect-video w-full" />
                                <div className="p-6">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-24 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-full mb-4" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}; 
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const PortfolioDetailSkeleton = () => {
    return (
        <div className="container py-12 px-4">
            <article className="max-w-4xl mx-auto space-y-8">
                {/* Hero Image Skeleton */}
                <Skeleton className="w-full h-[400px] rounded-lg" />

                {/* Title and Technologies Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-16 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                        <Skeleton className="h-7 w-22 rounded-full" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-24 rounded-md" />
                        <Skeleton className="h-10 w-28 rounded-md" />
                    </div>
                </div>

                {/* Content Skeleton */}
                <Card className="border-0 shadow-none">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                </Card>

                {/* Gallery Skeleton */}
                <div className="w-full py-8">
                    <Skeleton className="h-8 w-40 mx-auto mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="aspect-square rounded-md" />
                        <Skeleton className="aspect-square rounded-md" />
                        <Skeleton className="aspect-square rounded-md" />
                    </div>
                </div>
            </article>
        </div>
    );
}; 
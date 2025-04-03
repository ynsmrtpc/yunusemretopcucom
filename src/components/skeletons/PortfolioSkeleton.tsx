import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const ProjectCardSkeleton = () => {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <CardHeader className="px-4 pb-0 pt-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                </div>

                {/* Project details */}
                <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4">
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
                <Skeleton className="h-9 w-28 rounded-md" />
            </CardFooter>
        </Card>
    );
};

interface PortfolioSkeletonProps {
    count?: number;
}

export const PortfolioSkeleton = ({ count = 6 }: PortfolioSkeletonProps) => {
    return (
        <div className="container py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <Skeleton className="h-10 w-64 mx-auto mb-12" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array(count)
                        .fill(null)
                        .map((_, index) => (
                            <ProjectCardSkeleton key={index} />
                        ))}
                </div>
            </div>
        </div>
    );
}; 
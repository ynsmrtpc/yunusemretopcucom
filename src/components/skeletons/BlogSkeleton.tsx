import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const BlogCardSkeleton = () => {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <CardHeader className="px-4 pb-0 pt-4">
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28 rounded-md" />
            </CardFooter>
        </Card>
    );
};

interface BlogSkeletonProps {
    count?: number;
}

export const BlogSkeleton = ({ count = 6 }: BlogSkeletonProps) => {
    return (
        <div className="container py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <Skeleton className="h-10 w-64 mx-auto mb-12" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array(count)
                        .fill(null)
                        .map((_, index) => (
                            <BlogCardSkeleton key={index} />
                        ))}
                </div>
            </div>
        </div>
    );
}; 
import { Skeleton } from "@/components/ui/skeleton";

export const ContactSkeleton = () => {
    return (
        <div className="container py-12">
            <div className="max-w-6xl mx-auto">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="grid gap-12 md:grid-cols-2">
                    {/* İletişim Bilgileri */}
                    <div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6 mb-8" />

                        <div className="space-y-6">
                            {/* E-posta */}
                            <div>
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </div>

                            {/* Telefon */}
                            <div>
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-4 w-36" />
                            </div>

                            {/* Adres */}
                            <div>
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3 mt-1" />
                            </div>

                            {/* Sosyal Medya */}
                            <div>
                                <Skeleton className="h-6 w-32 mb-2" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-18" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* İletişim Formu */}
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-32 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}; 
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[420px]">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold">404</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-xl text-muted-foreground mb-6">
                        Oops! Aradığınız sayfayı bulamadık.
                    </p>
                    <Button asChild>
                        <Link to="/">Ana Sayfaya Dön</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
} 
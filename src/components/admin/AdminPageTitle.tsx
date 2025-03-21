import React from 'react';

interface AdminPageTitleProps {
    title: string;
    description?: string;
}

export const AdminPageTitle: React.FC<AdminPageTitleProps> = ({ title, description }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
        </div>
    );
}; 
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, ArrowUpDown } from "lucide-react";
import DialogAlert from "@/components/admin/DialogAlert";

// Kullanıcılar tablosu için kolonlar
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export const userColumns = (
    onEdit: (user: User) => void,
    onDelete: (id: number) => void
): ColumnDef<User>[] => [
        {
            accessorKey: "name",
            header: "İsim",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                return (
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${role === "admin"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-green-500/10 text-green-500"
                        }`}>
                        {role === "admin" ? "Admin" : "Kullanıcı"}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Kayıt Tarihi",
            cell: ({ row }) => {
                return new Date(row.getValue("created_at")).toLocaleDateString("tr-TR");
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(user)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <DialogAlert
                            title="Kullanıcıyı Sil"
                            description="Bu kullanıcıyı silmek istediğinizden emin misiniz?"
                            onClick={() => onDelete(user.id)}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </DialogAlert>
                    </div>
                );
            },
        },
    ];

// Blog yazıları tablosu için kolonlar
export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    status: string;
    views: number;
    created_at: string;
    slug: string;
}

export const blogColumns = (
    onEdit: (blog: BlogPost) => void,
    onDelete: (id: number) => void
): ColumnDef<BlogPost>[] => [
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Başlık
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "excerpt",
            header: "Özet",
            cell: ({ row }) => {
                return (
                    <div className="line-clamp-1 text-muted-foreground">
                        {row.getValue("excerpt")}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Durum
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status === "published"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                        {status === "published" ? "Yayında" : "Taslak"}
                    </div>
                );
            },
        },
        {
            accessorKey: "views",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Görüntülenme
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Tarih
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return new Date(row.getValue("created_at")).toLocaleDateString("tr-TR");
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const blog = row.original;

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(blog)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <DialogAlert
                            title="Blog Yazısını Sil"
                            description="Bu blog yazısını silmek istediğinizden emin misiniz?"
                            onClick={() => onDelete(blog.id)}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </DialogAlert>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

// Projeler tablosu için kolonlar
export interface Project {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    views: number;
    slug: string;
    created_at: string;
    year: string;
}

export const projectColumns = (
    onEdit: (project: Project) => void,
    onDelete: (id: number) => void
): ColumnDef<Project>[] => [
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Başlık
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "description",
            header: "Açıklama",
            cell: ({ row }) => {
                return (
                    <div className="line-clamp-1 text-muted-foreground">
                        {row.getValue("description")}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "category",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Kategori
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Durum
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status === "completed"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                        {status === "completed" ? "Tamamlandı" : "Devam Ediyor"}
                    </div>
                );
            },
        },
        {
            accessorKey: "views",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Görüntülenme
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "year",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Yıl
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            enableSorting: true,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const project = row.original;

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(project)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <DialogAlert
                            title="Projeyi Sil"
                            description="Bu projeyi silmek istediğinizden emin misiniz?"
                            onClick={() => onDelete(project.id)}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </DialogAlert>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

// Mesajlar tablosu için kolonlar
export interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

export const messageColumns = (
    onDelete: (id: number) => void
): ColumnDef<Message>[] => [
        {
            accessorKey: "name",
            header: "İsim",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "subject",
            header: "Konu",
        },
        {
            accessorKey: "message",
            header: "Mesaj",
            cell: ({ row }) => {
                return (
                    <div className="line-clamp-1 text-muted-foreground">
                        {row.getValue("message")}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Tarih",
            cell: ({ row }) => {
                return new Date(row.getValue("created_at")).toLocaleDateString("tr-TR");
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const message = row.original;

                return (
                    <div className="flex items-center justify-end gap-2">
                        <DialogAlert
                            title="Mesajı Sil"
                            description="Bu mesajı silmek istediğinizden emin misiniz?"
                            onClick={() => onDelete(message.id)}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </DialogAlert>
                    </div>
                );
            },
        },
    ]; 
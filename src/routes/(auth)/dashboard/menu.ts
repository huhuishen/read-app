export interface AdminMenuItem {
    label: string;
    icon: string;
    href?: string;
    tabs?: string[];
    permission?: string;
    children?: AdminMenuItem[];
}

export const adminMenu: AdminMenuItem[] = [
    {
        label: "回到主页",
        icon: "home",
        href: "/",
    },
    {
        label: "管理",
        icon: "settings",
        href: "/dashboard/articles",
        tabs: ["articles", "users", "categories", "stats"]
        // children: [
        //     {
        //         label: "作品",
        //         icon: "",
        //         href: "/dashboard/articles",
        //         permission: "article.review",
        //     },
        //     {
        //         label: "用户",
        //         icon: "",
        //         href: "/dashboard/users",
        //         permission: "article.review",
        //     },
        // ],
    },
    {
        label: "设置",
        icon: "settings",
        href: "/dashboard/settings",
        permission: "user.manage",
    },
    {
        label: "数据库",
        icon: "database",
        href: "/dashboard/database",
        permission: "user.manage",
    },
];

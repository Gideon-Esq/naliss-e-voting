import { redirect } from "next/navigation";import{AdminShell}from"@/components/admin-shell";import{isAdminAuthenticated}from"@/lib/admin-auth";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function AdminLayout({children}:{children:React.ReactNode}){if(!await isAdminAuthenticated())redirect("/admin/login");return <AdminShell>{children}</AdminShell>}

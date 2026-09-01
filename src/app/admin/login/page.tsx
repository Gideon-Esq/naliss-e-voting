import { redirect } from "next/navigation"; import { AdminLoginForm } from "@/components/admin-login-form"; import { Logo } from "@/components/logo"; import { isAdminAuthenticated } from "@/lib/admin-auth";
export default async function AdminLogin(){if(await isAdminAuthenticated())redirect("/admin");return <main className="auth-page"><Logo/><AdminLoginForm/></main>}


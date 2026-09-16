import { redirect } from "next/navigation";
import { LoginShell } from "@/components/admin/login-shell";
import { getSession } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return <LoginShell />;
}

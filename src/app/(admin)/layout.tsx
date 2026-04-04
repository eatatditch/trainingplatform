import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

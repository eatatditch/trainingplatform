import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EmployeeSidebar } from "@/components/layout/employee-sidebar";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeSidebar user={user} />
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

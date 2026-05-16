
export const dynamic = "force-dynamic";

import DashboardHeader from "@/components/dashboardHeader";
import MobileNav from "@/components/farmer/MobileNav";
import { FarmerSidebar } from "@/components/sidebar";
import { auth } from "@clerk/nextjs/server";

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims, userId } = await auth();

  let role =
    sessionClaims?.metadata?.role ??
    sessionClaims?.public_metadata?.role ??
    sessionClaims?.unsafe_metadata?.role;

  return (
    <div className="agri-hero flex min-h-screen text-foreground transition-colors">
      
      <aside className="hidden w-64 flex-shrink-0 border-r border-border/70 bg-card/75 backdrop-blur-xl md:flex">
        <FarmerSidebar  />
      </aside>

      <div className="flex flex-1 flex-col">

        <header className="sticky top-0 z-40 px-3 py-2 md:px-4 md:py-3">
          {role && <DashboardHeader role={role} />}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {userId && (
          <div className="border-t border-border/70 bg-card/65 backdrop-blur-xl md:hidden">
            <MobileNav userId={userId} />
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminLayout;
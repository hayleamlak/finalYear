

// import DashboardHeader from "@/components/dashboardHeader";
// import MobileSidebar from "@/components/MobileSidebar";
// import SidebarContent from "@/components/SidebarContent";
// import { auth } from "@clerk/nextjs/server";
// import { getRole } from "@/utils/role";

// export const dynamic = "force-dynamic";

// async function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { userId, sessionClaims } = await auth();
//   const role = await getRole();

//   const resolvedRole =
//     !role || role === "BUYER" ? "user" : role;

//   return (
//     <div className="flex min-h-screen bg-gray-100">
      
//       {/* Desktop Sidebar */}
//       <div className="hidden md:flex w-64 bg-white border-r border-gray-200 shadow-sm">
//         <SidebarContent role={resolvedRole} userId={userId} />
//       </div>

//       <div className="flex flex-col flex-1">
        
//         <div className="w-full sticky top-0 z-40 bg-white border-b flex items-center px-4">
//           <MobileSidebar role={resolvedRole} userId={userId} />
//           <DashboardHeader role={resolvedRole} />
//         </div>

//         <main className="flex-1 p-6 overflow-y-auto">
//           <div className="max-w-7xl mx-auto">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default AdminLayout;












import DashboardHeader from "@/components/dashboardHeader";
import MobileSidebar from "@/components/MobileSidebar";
import SidebarContent from "@/components/SidebarContent";
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/utils/role";

export const dynamic = "force-dynamic";

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  const role = await getRole();
  const claimRole =
    sessionClaims?.metadata?.role ??
    sessionClaims?.public_metadata?.role ??
    sessionClaims?.unsafe_metadata?.role;
  const resolvedRole = !role || role === "BUYER" ? claimRole || "user" : role;

  return (
    <div className="agri-hero flex min-h-screen transition-colors duration-500">

      {/* Desktop Sidebar */}
      <div className="hidden min-[1291px]:flex w-64 border-r border-border/70 bg-card/75 shadow-[0_22px_45px_-35px_var(--foreground)] backdrop-blur-xl transition-colors">
        <SidebarContent role={resolvedRole} userId={userId} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <div className="sticky top-0 z-40 flex w-full items-center px-3 py-2 transition-colors md:px-4 md:py-3">
          <MobileSidebar role={resolvedRole} userId={userId} />
          <DashboardHeader role={resolvedRole} />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

      </div>
    </div>
  );
}

export default AdminLayout;
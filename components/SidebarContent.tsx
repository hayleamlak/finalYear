
// import Link from "next/link";
// import { cn } from "@/lib/utils";

// interface Props {
//   role: string;
//   userId: string | null;
// }

// const sidebarLinks = [
//   {
//     label: "MENU",
//     key: "dashboard",
//     links: [
//       { name: "Dashboard", link: "/admin", key2: "dashboard" },
//     ],
//   },
//   {
//     label: "MANAGE",
//     key: "manage",
//     links: [
//       { name: "Users", link: "/admin/users", key2: "users" },
//       { name: "Farmers", link: "/admin/farmers", key2: "farmers" },
//       { name: "Products", link: "/admin/product", key2: "products" },
//       { name: "Messages", link: "/admin/messages", key2: "messages" },
//       { name: "Orders", link: "/admin/order", key2: "order" },
//       { name: "Home", link: "/", key2: "home" },
//     ],
//   },
// ];

// const farmerSideBarLinks = (userId: string) => [
//   {
//     label: "MENU",
//     key: "dashboard",
//     links: [{ name: "Dashboard", link: "/farmer", key2: "dashboard" }],
//   },
//   {
//     label: "MANAGE",
//     key: "manage",
//     links: [
//       { name: "Orders", link: `/farmer/orders`, key2: "orders" },
//       { name: "Cart", link: `/cart/${userId}`, key2: "cart" },
//     ],
//   },
// ];

// export default function SidebarContent({ role, userId }: Props) {
//   const linksToRender =
//     (role === "farmer" || role === "seller" || role === "SELLER") && userId
//       ? farmerSideBarLinks(userId)
//       : sidebarLinks;

//   return (
//     <div className="px-4 py-4 fixed">
//       <div className="border text-center bg-green-800 rounded font-bold text-2xl text-green-300 mb-6 p-3">
//         Green Coffee
//       </div>

//       {linksToRender.map((section) => (
//         <div key={section.key} className="mb-6">
//           <h1 className="font-bold text-gray-500 text-sm mb-2">
//             {section.label}
//           </h1>

//           <div className="flex flex-col gap-2">
//             {section.links.map((link) => (
//               <Link
//                 key={link.key2}
//                 href={link.link}
//                 className={cn(
//                   "rounded-lg px-4 py-3 text-sm font-semibold transition",
//                   "hover:bg-green-700 hover:text-white",
//                   "bg-gray-100 text-gray-800"
//                 )}
//               >
//                 {link.name}
//               </Link>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }















import Link from "next/link";
import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";

interface Props {
  role: string;
  userId: string | null;
}

const sidebarLinks = [
  {
    label: "MENU",
    key: "dashboard",
    links: [{ name: "Dashboard", link: "/admin", key2: "dashboard" }],
  },
  {
    label: "MANAGE",
    key: "manage",
    links: [
      { name: "Users", link: "/admin/users", key2: "users" },
      { name: "Farmers", link: "/admin/farmers", key2: "farmers" },
      { name: "Products", link: "/admin/product", key2: "products" },
      { name: "Messages", link: "/admin/messages", key2: "messages" },
      { name: "Orders", link: "/admin/order", key2: "order" },
      { name: "Home", link: "/", key2: "home" },
    ],
  },
];

const farmerSideBarLinks = (userId: string) => [
  {
    label: "MENU",
    key: "dashboard",
    links: [{ name: "Dashboard", link: "/farmer", key2: "dashboard" }],
  },
  {
    label: "MANAGE",
    key: "manage",
    links: [
      { name: "Orders", link: `/farmer/orders`, key2: "orders" },
      { name: "Cart", link: `/cart/${userId}`, key2: "cart" },
    ],
  },
];

export default function SidebarContent({ role, userId }: Props) {
  const linksToRender =
    (role === "farmer" || role === "seller" || role === "SELLER") && userId
      ? farmerSideBarLinks(userId)
      : sidebarLinks;

  return (
    <aside className="fixed h-screen w-64 border-r border-border/70 bg-card/80 px-5 py-6 shadow-[0_22px_45px_-35px_var(--foreground)] backdrop-blur-xl">
      
      {/* Logo */}
      <div className="mb-8">
        <div className="agri-gradient flex items-center gap-1 rounded-2xl py-3 text-center text-xl font-bold tracking-wide text-white shadow-lg">
        <Coffee size={40} strokeWidth={2} className="fill-amber-100 text-amber-50" /> Coffee
        </div>
      </div>

      {linksToRender.map((section) => (
        <div key={section.key} className="mb-8">

          {/* Section label */}
          <h1 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {section.label}
          </h1>

          <div className="flex flex-col gap-2">
            {section.links.map((link) => (
              <Link
                key={link.key2}
                href={link.link}
                className={cn(
                  "flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  "border border-transparent text-foreground/90 hover:border-primary/35 hover:bg-primary/12 hover:text-primary"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}


import { getRole } from "@/utils/role";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";

const sidebarLinks = [
  {
    label: "MENU",
    key: "dashboard",
    links: [
      { name: "Dashboard", link: "/admin", key2: "dashboard" },
    ],
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

export default async function AdminSidebarContent() {
  const { userId } = await auth();
  const role = await getRole();

  const linksToRender =
    (role === "farmer" || role === "seller" || role === "SELLER") && userId
      ? farmerSideBarLinks(userId)
      : sidebarLinks;


  return (
    <div className="px-4 py-4 transition-colors duration-500">
      <div className="agri-gradient mb-6 flex items-center gap-3 rounded-[1.35rem] px-4 py-3 text-xl font-bold text-white shadow-[0_18px_35px_-24px_var(--primary)]">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
          <Coffee size={24} />
        </span>
        <span className="leading-none">Green Coffee</span>
      </div>

      {linksToRender.map((section) => (
        <div key={section.key} className="mb-6">
          <h1 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 transition-colors dark:text-gray-400">
            {section.label}
          </h1>
  
          <div className="flex flex-col gap-2">
            {section.links.map((link) => (
              <Link
                key={link.key2}
                href={link.link}
                className={cn(
                  "rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold transition-all duration-300",
                  "bg-gray-100 text-gray-800 hover:-translate-y-0.5 hover:bg-green-700 hover:text-white",
                  "dark:bg-[#1f140d] dark:text-[#f5f5dc] dark:hover:bg-green-700 dark:hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

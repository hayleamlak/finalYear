

import { getRole } from "@/utils/role";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";
import AddProduct from "./form/add-product";
import { getTranslations } from "next-intl/server";



// Farmer side bar
export async function FarmerSidebar() {
  const { userId } = await auth();
  const role = await getRole();
  const ts = await getTranslations("sidebar");
  const tf = await getTranslations("form");
  

  const links =
   ( role === "farmer" || role === "seller" || role === "SELLER") && userId
      ? [
          { name: ts("dashboard"), link: "/farmer" },
          { name: ts("orders"), link: "/farmer/orders" },
          { name: ts("Profile"), link: `/farmer/profile/${userId}` },
          { name: ts("home"), link: `/` },
        ]
      : [{ name: ts("dashboard"), link: "/admin" }];

  return (
    <div className="glass-panel fixed z-50 flex h-full w-72 flex-col border-r border-border/70 px-5 py-5 shadow-[0_24px_50px_-36px_var(--foreground)] backdrop-blur-2xl">
      <div className="agri-gradient mb-6 flex items-center gap-3 rounded-[1.35rem] px-4 py-3 text-xl font-bold text-white shadow-[0_18px_35px_-24px_var(--primary)]">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
          <Coffee size={24} />
        </span>
        <span className="leading-none">Green Coffee</span>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((item) => (
          <Link
            key={item.name}
            href={item.link}
            className={cn(
              "z-0 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold transition-all duration-300",
              "bg-card/70 text-foreground hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/12 hover:text-primary"
            )}
          >
            {item.name}
          </Link>
        ))}
        <div className="mt-4 border-t border-border pt-4">
          <h2 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{tf("newProduct")}</h2>
        </div>
        <AddProduct />
      </nav>
    </div>
  );
}


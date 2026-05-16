

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
    <div className="glass-panel fixed z-50 flex h-full flex-col p-4">
      <div className="agri-gradient mb-6 flex items-center rounded-2xl py-3 text-center text-xl font-bold text-white">
       <Coffee /> Green Coffee
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((item) => (
          <Link
            key={item.name}
            href={item.link}
            className={cn(
              "z-0 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold transition-all duration-300",
              "bg-card/70 text-foreground hover:border-primary/35 hover:bg-primary/12 hover:text-primary"
            )}
          >
            {item.name}
          </Link>
        ))}
        <div className="mt-4 border-t border-border pt-4">  
            <h2 className="mb-2 mt-4 text-sm font-semibold text-muted-foreground">{tf("newProduct")}</h2>
        </div>
        <AddProduct />
      </nav>
    </div>
  );
}


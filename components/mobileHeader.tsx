

"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ThemeToggle from "./theme/theme-toggle";
import LoaderBtn from "./loaderBtn";


export default function MobileHeader() {

  const { user } = useUser();
  const role = user?.publicMetadata?.role ?? user?.unsafeMetadata?.role;

  const orderLink = role === "admin" || role === "ADMIN" ? `${role}/order` : `${role}`;


  const headerLinks = [
    { name: "Home", link: "/", key: "home" },
    { name: "Shop", link: "/product", key: "shop" },
    { name: "About", link: "/about", key: "about" },
    { name: "Contact Us", link: "/contact", key: "contact" },
    { name: "Orders", link: `/${orderLink}`, key: "orders" },
    { name: "Notifications", link: "/notifications", key: "notifications" },
    { name: "Today's_Market", link: `/todays_market`, key: "today-market" },
    { name: "Chat_Members", link: `/chats/${user?.id}`, key: "chatmembers" },
    { name: "Dashboard", link: `/${role}`, key: "dashboard" },
    { name: "Profile", link: `/profile/${user?.id}`, key: "profile" },
  ];
  
  return (
    <div className="min-[1317px]:hidden z-10 mt-3 animate-in slide-in-from-top-3 rounded-2xl border border-white/35 bg-background/80 px-4 py-4 text-foreground shadow-[0_25px_45px_-35px_var(--foreground)] backdrop-blur-xl dark:border-white/10 dark:bg-card/65">
      <nav className="flex flex-col items-start justify-start gap-3 text-base font-semibold">
        {headerLinks.map((item) => (
          <LoaderBtn
            key={item.key}
            btnName={item.name}
            linkTo={item.link}
            className="w-full justify-start rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-left text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          />
        ))}

        {/* USER SECTION */}
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton>
            <span className="text-primary">Login</span>
          </SignInButton>
        </SignedOut>
        <ThemeToggle />
      </nav>
    </div>
  );
}

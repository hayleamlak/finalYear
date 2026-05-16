"use client";

import Link from "next/link";
import { Menu, X, ShoppingCart, Bell, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useState } from "react";
import MobileHeader from "./mobileHeader";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeToggle from "./theme/theme-toggle";

export default function Header({
  cartQuantity,
  notification,
}: {
  cartQuantity?: number;
  notification?: number;
}) {
  const { user } = useUser();
  const role = user?.publicMetadata?.role ?? user?.unsafeMetadata?.role;

  const orderLink = role === "admin" || role === "ADMIN" ? `${role}/order` : `${role}`;

  const headerLinks = [
    { name: "Home", link: "/", key: "home" },
    { name: "Shop", link: "/product", key: "shop" },
    { name: "About", link: "/about", key: "about" },
    { name: "Contact_Us", link: "/contact", key: "contact" },
    { name: "Orders", link: `/${orderLink}`, key: "orders" },
    { name: "Today's_Market", link: `/todays_market`, key: "today-market" },
    { name: "Chat_Members", link: `/chats/${user?.id}`, key: "chatmembers" },
    { name: "Dashboard", link: `/${role}`, key: "dashboard" },
    { name: "Profile", link: `/profile/${user?.id}`, key: "profile" },
  ];

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const userId = user?.id;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 py-3 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/45 bg-background/70 px-4 py-3 shadow-[0_24px_40px_-30px_var(--foreground)] backdrop-blur-xl dark:border-white/10 dark:bg-card/60">
        <Link
          href="/"
          className="agri-gradient inline-flex items-center gap-2 rounded-xl px-3 py-2 text-base font-extrabold text-white shadow-lg max-[355px]:hidden"
        >
          <Sparkles className="size-4" />
          EGC
        </Link>

        <div className="hidden min-[477px]:block">
          <ThemeToggle />
        </div>

        <nav className="hidden min-[1317px]:flex items-center gap-7 text-sm font-medium text-foreground/90">
          {headerLinks.map((link) => (
            <Link
              href={link.link}
              key={link.key}
              className="rounded-full px-3 py-1.5 transition-all duration-300 hover:bg-primary/15 hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div>
            <LocaleSwitcher />
          </div>

          <div className="relative cursor-pointer rounded-xl p-1 transition-colors hover:bg-primary/15 hover:text-primary">
            <Link href={userId ? `/cart/${userId}` : "/cart"}>
              <ShoppingCart className="w-7 h-7" />
            </Link>
            <span className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              {cartQuantity ?? 0}
            </span>
          </div>

          {notification && notification > 0 ? (
            <div className="relative hidden min-[298px]:block">
              <Link
                href={`/notifications`}
                className="rounded-xl p-1 transition-colors hover:bg-accent/25 hover:text-accent"
              >
                <Bell size={22} />
              </Link>
              <span className="absolute -right-3 -top-4 flex w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {notification}
              </span>
            </div>
          ) : null}

          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Button className="px-4 py-2 text-sm">
              <SignInButton />
            </Button>
          </SignedOut>

          <button
            className="min-[1317px]:hidden cursor-pointer rounded-xl p-1 transition-colors hover:bg-primary/15"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
      </div>

      {isMobileOpen && <MobileHeader />}
    </header>
  );
}

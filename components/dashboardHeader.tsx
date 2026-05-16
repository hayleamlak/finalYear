

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import ThemeToggle from "./theme/theme-toggle";
import LocaleSwitcher from "./LocaleSwitcher";
import { getAllNotification } from "@/utils/services/notification";
import Link from "next/link";
import { Bell } from "lucide-react";


async function DashboardHeader({ role }: { role: string }) {
  const notification = await getAllNotification();
  return (
    <div className="glass-panel flex w-full items-center justify-between rounded-2xl px-4 py-3 text-black sm:px-6 dark:text-white">
      <span className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground/80">
        {role} Dashboard
      </span>
      <ThemeToggle />

      {/* CENTER (desktop only) */}
      <div className="hidden sm:block">
        <LocaleSwitcher />
      </div>

      <div>
        {notification.data && notification.data.length > 0 ? (
          <div className="relative hidden min-[298px]:block">
            <Link
              href={`/notifications`}
              className="rounded-xl p-1 text-foreground transition-colors hover:bg-accent/20 hover:text-accent"
            >
              <Bell size={25} className="text-2xl" />
            </Link>
            <span className="absolute -right-4 -top-4 flex w-9 items-center justify-center rounded-full bg-red-500 text-sm text-white">
              {notification.data.length > 100 ? "100+" : notification.data.length}
            </span>
          </div>
        ) : null}
      </div>

      {/* RIGHT */}
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </div>
  );
}

export default DashboardHeader;

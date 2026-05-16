"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import SidebarContent from "./SidebarContent";

interface Props {
  role: string;
  userId: string | null;
}

export default function MobileSidebar({ role, userId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="min-[1291px]:hidden rounded-xl p-2 transition-colors hover:bg-primary/12"
      >
        <Menu />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 transform border-r border-white/25 bg-card/90 shadow-[0_20px_50px_-30px_var(--foreground)] backdrop-blur-xl transition-transform duration-300 dark:border-white/10 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4 font-bold dark:text-black">
          <button onClick={() => setOpen(false)} className="cursor-pointer rounded-xl p-1 font-bold transition-colors hover:bg-primary hover:text-primary-foreground">
            <X />
          </button>
        </div>

        <SidebarContent role={role} userId={userId} />
      </div>
    </>
  );
}


// "use client";

import { LucideIcon } from "lucide-react";
import { CardContent, Card, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import LoaderBtn from "../loaderBtn";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

interface CardProps {
  total?: number;
  cardName: string;
  link: string;
  icon: LucideIcon; // icon type
  className?: string; // <-- new optional className prop
}

async function Cards({ total, cardName, link, icon: Icon, className }: CardProps) {
  const ta = await getTranslations("admin");
  const tb = await getTranslations("button");
  return (
    <Card
      className={`overflow-hidden rounded-[1.65rem] border-border/80 bg-card/90 p-4 text-gray-800 shadow-[0_22px_50px_-34px_var(--foreground)] transition-all duration-300 hover:-translate-y-0.5 dark:bg-[#1f140d] dark:text-[#f5f5dc] ${className || ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold tracking-[-0.02em]">{ta(cardName)}</CardTitle>

        {/* Dynamic icon */}
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary dark:bg-primary/18">
          <Icon className="h-5 w-5" />
        </span>
      </CardHeader>

      <CardContent>
        <p className="text-4xl font-bold tracking-[-0.04em]">{total ?? 0}</p>
        <LoaderBtn
          className="mt-4 w-full cursor-pointer border-2 border-border/80 bg-transparent text-gray-800 hover:-translate-y-0.5 hover:text-white dark:border-[#3c2a21] dark:text-[#f5f5dc] dark:hover:text-black"
          btnName={tb("detail")}
          linkTo={link}
        />

      </CardContent>
    </Card>
  );
}

export default Cards;
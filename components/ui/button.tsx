import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-[0.01em] transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "agri-gradient text-primary-foreground shadow-[0_18px_35px_-22px_var(--primary)] hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.985]",
        destructive:
          "bg-destructive text-white shadow-[0_18px_30px_-24px_var(--destructive)] hover:-translate-y-0.5 hover:bg-destructive/90 active:translate-y-0",
        outline:
          "border border-border/80 bg-background/80 backdrop-blur-md shadow-[0_10px_24px_-22px_var(--foreground)] hover:-translate-y-0.5 hover:bg-accent/35 hover:text-accent-foreground dark:bg-input/25 dark:border-input dark:hover:bg-input/45",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_12px_24px_-20px_var(--foreground)] hover:-translate-y-0.5 hover:bg-secondary/85",
        ghost:
          "hover:bg-accent/45 hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-2xl px-7 has-[>svg]:px-5",
        icon: "size-10",
        "icon-sm": "size-[2.15rem]",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

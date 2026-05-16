
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative z-10 px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "glass-panel border-white/45 shadow-[0_20px_45px_-30px_var(--foreground)]",
            headerTitle: "text-foreground text-2xl",
            headerSubtitle: "text-foreground/70",
            formButtonPrimary: "agri-gradient text-white hover:brightness-110",
            formFieldInput: "rounded-xl border-border/70 bg-background/70",
            socialButtonsBlockButton:
              "rounded-xl border-border/60 bg-card/65 hover:bg-primary/10",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}

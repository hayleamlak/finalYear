"use client"


import Image from "next/image";
import { motion } from "framer-motion";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="agri-hero flex min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full flex-col items-center justify-center p-6 md:w-1/2 md:p-10"
      >
        <div className="glass-panel relative w-full overflow-hidden rounded-3xl border border-white/45 py-8 shadow-[0_30px_60px_-40px_var(--foreground)] dark:border-white/15">
          <Image
            src="/cup_coffee.png"
            alt="Green Coffee Art"
            fill
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/35 to-primary/35" />
          {children}
        </div>
      </motion.div>

      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden md:flex">
        <Image
          src="/green_coffee.png"
          alt="Green Coffee Art"
          fill
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-black/20 to-accent/30" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="glass-panel absolute bottom-10 left-10 max-w-md rounded-3xl p-6 text-foreground"
        >
          <h1 className="mb-2 text-4xl font-bold">Ethiopian Green Coffee</h1>
          <p className="text-lg text-foreground/85">
            Pure. Organic. Authentic. From Ethiopia to the world.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;

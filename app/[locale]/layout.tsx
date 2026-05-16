



// new

import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import PopupNotification from "@/components/popupNotification";
import { getAllUnreadNotifications } from "@/utils/services/notification";
import Footer from "@/components/footer";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import LanguageProvider from "@/Providers/LanguageProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { auth } from "@clerk/nextjs/server";
import { trackUserSession } from "./actions/sessionTrack";
import { setUserDefaultRole } from "./actions/general";

const sora = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EGCSP",
  description: "Ethiopian Green Coffee Shoping Platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {

  const { userId } = await auth();


    // give the default role if the user is new
    if (userId) {
      await setUserDefaultRole(userId);
    }
  

  // tracking  user information if only  logged in
  if (userId) {
    await trackUserSession(); 
  }

  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  const notification = await getAllUnreadNotifications();

  return (
    <ClerkProvider>
     <html lang={locale}>
        <body
          className={`${sora.variable} ${spaceGrotesk.variable} antialiased`}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            {/* PopUp notification */}
            <div className="relative">
              {notification.data && notification.data.length >0 && (
                <PopupNotification
                  leftNotifications={notification.data.length - 1}
                  data={notification?.data[0]}
                />
              )}
            </div>
            <Toaster position="bottom-right" richColors />
            <ThemeProvider>
              <LanguageProvider>
                  {children}
              </LanguageProvider>
            </ThemeProvider>

            <Footer />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

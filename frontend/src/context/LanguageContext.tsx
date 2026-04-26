import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type Locale = "en" | "am" | "om";

type TranslationKey =
  | "nav.products"
  | "nav.cart"
  | "nav.account"
  | "language.label"
  | "account.title"
  | "account.subtitle"
  | "account.guest"
  | "account.signIn"
  | "account.editProfile"
  | "account.orders"
  | "account.profile"
  | "account.language"
  | "account.settings"
  | "account.appearance"
  | "account.darkMode"
  | "account.lightMode"
  | "account.signedInAs"
  | "account.signOut"
  | "orders.title"
  | "orders.empty"
  | "profile.title"
  | "profile.empty"
  | "cart.back"
  | "cart.title"
  | "cart.emptyTitle"
  | "cart.emptyText"
  | "cart.browseProducts"
  | "cart.stock"
  | "cart.remove"
  | "cart.subtotal"
  | "cart.checkout"
  | "cart.continueShopping"
  | "cart.clearCart"
  | "cart.item.one"
  | "cart.item.other";

const MESSAGES: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "nav.products": "Products",
    "nav.cart": "Cart",
    "nav.account": "Account",
    "language.label": "Language",
    "account.title": "Account",
    "account.subtitle": "Manage your orders, profile, language, and app settings.",
    "account.guest": "You are not signed in",
    "account.signIn": "Sign in",
    "account.editProfile": "Edit Profile",
    "account.orders": "Orders",
    "account.profile": "Profile",
    "account.language": "Language",
    "account.settings": "Settings",
    "account.appearance": "Appearance",
    "account.darkMode": "Dark mode",
    "account.lightMode": "Light mode",
    "account.signedInAs": "Signed in as",
    "account.signOut": "Sign out",
    "orders.title": "Orders",
    "orders.empty": "No orders yet. Your order history will appear here.",
    "profile.title": "Profile",
    "profile.empty": "Profile details screen is ready for your user data.",
    "cart.back": "Back",
    "cart.title": "My cart",
    "cart.emptyTitle": "Your cart is empty",
    "cart.emptyText": "Browse products and tap Add to cart.",
    "cart.browseProducts": "Browse products",
    "cart.stock": "Stock",
    "cart.remove": "Remove",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Proceed to checkout",
    "cart.continueShopping": "Continue shopping",
    "cart.clearCart": "Clear cart",
    "cart.item.one": "item",
    "cart.item.other": "items",
  },
  am: {
    "nav.products": "ምርቶች",
    "nav.cart": "ጋሪ",
    "nav.account": "መለያ",
    "language.label": "ቋንቋ",
    "account.title": "መለያ",
    "account.subtitle": "ትዕዛዞችን፣ ፕሮፋይልን፣ ቋንቋን እና የመተግበሪያ ቅንብሮችን ያስተዳድሩ።",
    "account.guest": "አልገቡም",
    "account.signIn": "ግባ",
    "account.editProfile": "ፕሮፋይልን አስተካክል",
    "account.orders": "ትዕዛዞች",
    "account.profile": "ፕሮፋይል",
    "account.language": "ቋንቋ",
    "account.settings": "ቅንብሮች",
    "account.appearance": "መልክ",
    "account.darkMode": "ጨለማ ሁኔታ",
    "account.lightMode": "ብርሃን ሁኔታ",
    "account.signedInAs": "የገቡት",
    "account.signOut": "ውጣ",
    "orders.title": "ትዕዛዞች",
    "orders.empty": "እስካሁን ትዕዛዝ የለም። ታሪክዎ እዚህ ይታያል።",
    "profile.title": "ፕሮፋይል",
    "profile.empty": "የፕሮፋይል ዝርዝሮች ገጽ ለተጠቃሚ መረጃ ዝግጁ ነው።",
    "cart.back": "ተመለስ",
    "cart.title": "የእኔ ጋሪ",
    "cart.emptyTitle": "ጋሪዎ ባዶ ነው",
    "cart.emptyText": "ምርቶችን ይመልከቱ እና ወደ ጋሪ አክል ይጫኑ።",
    "cart.browseProducts": "ምርቶችን ይመልከቱ",
    "cart.stock": "እቃ",
    "cart.remove": "አስወግድ",
    "cart.subtotal": "ጠቅላላ",
    "cart.checkout": "ወደ ክፍያ ቀጥል",
    "cart.continueShopping": "ግዢን ቀጥል",
    "cart.clearCart": "ጋሪውን አጽዳ",
    "cart.item.one": "እቃ",
    "cart.item.other": "እቃዎች",
  },
  om: {
    "nav.products": "Oomishaalee",
    "nav.cart": "Gaarii",
    "nav.account": "Akoontii",
    "language.label": "Afaan",
    "account.title": "Akoontii",
    "account.subtitle": "Ajaja, piroofaayilii, afaanii fi qindaa'ina appii to'achiisi.",
    "account.guest": "Hin seeniin",
    "account.signIn": "Seeni",
    "account.editProfile": "Piroofaayilii gulaali",
    "account.orders": "Ajajoota",
    "account.profile": "Piroofaayilii",
    "account.language": "Afaan",
    "account.settings": "Qindaa'ina",
    "account.appearance": "Bifa",
    "account.darkMode": "Haala dukkanaa",
    "account.lightMode": "Haala ifaa",
    "account.signedInAs": "Kan seene",
    "account.signOut": "Ba'i",
    "orders.title": "Ajajoota",
    "orders.empty": "Ammaaf ajajni hin jiru. Seenaa ajaja kee asitti mul'ata.",
    "profile.title": "Piroofaayilii",
    "profile.empty": "Fuulli ibsa piroofaayilii odeeffannoo fayyadamaa keetiif qophaa'eera.",
    "cart.back": "Duubatti",
    "cart.title": "Gaarii koo",
    "cart.emptyTitle": "Gaariin kee duwwaa dha",
    "cart.emptyText": "Oomishaalee ilaaliitii Add to cart tuqi.",
    "cart.browseProducts": "Oomishaalee ilaali",
    "cart.stock": "Kuusaa",
    "cart.remove": "Haqi",
    "cart.subtotal": "Waliigala xiqqaa",
    "cart.checkout": "Kaffaltiitti itti fufi",
    "cart.continueShopping": "Bittaa itti fufi",
    "cart.clearCart": "Gaarii qulqulleessi",
    "cart.item.one": "oomisha",
    "cart.item.other": "oomishaalee",
  },
};

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  getCountLabel: (count: number) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: TranslationKey) => MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
    const getCountLabel = (count: number) => `${count} ${count === 1 ? t("cart.item.one") : t("cart.item.other")}`;

    return {
      locale,
      setLocale,
      t,
      getCountLabel,
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}

export type { Locale, TranslationKey };

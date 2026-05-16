"use client";

// //  PLEASE DO NOT DELETE THIS CODE.BECAUSE THE WORKING CODE MAY CAUSE ERROR: SO AT THAT TIME YOU SHOULD USE THIS CODE. IT IS PERFECTILY WORKING CODE WITHOUT DYNAMIC LANGUAGE CONVERSION

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useState, useMemo } from "react";
import { addToCart } from "@/utils/services/cartItem";
import { ShoppingCart, ArrowRight, Coffee, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@prisma/client";
import LoaderBtn from "../loaderBtn";
import { useTranslations } from "next-intl";
import ReviewCard from "../review/ReviewCard";

type ProductReview = {
  id: string;
  name: string;
  date: string;
  comment: string | null;
  rating: number;
};

interface roleProps {
  role: "ADMIN" | "BUYER" | "SELLER" | "LAB_TECHNICIAN" | "CASHIER" | "/";
  products: Product[];
  reviewData?: Record<string, ProductReview[]>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage({ role, products, reviewData }: roleProps) {
  const { user } = useUser();
  const router = useRouter();
  const tc = useTranslations("home");
  const tf = useTranslations("form");
  const tb = useTranslations("button");
  const tcc = useTranslations("cart");
  const tln = useTranslations("language");
  console.log("language : ", tln("lang"));

  const platformDescription =
    tln("lang") === "አማርኛ"
      ? "እንኳን ደህና መጡ!. ይህ ፕላትፎርም ከአካባቢ ገበሬዎች ትኩስ ምርቶችን በቀጥታ ለመግዛት እና ለመሸጥ ይረዳዎታል።. እቃዎችን መፈለግ ፣ ዋጋዎችን መመልከት እና እቃዎችን ቀላል በሆነ ሁኔታ ወደ ጋሪዎ መጨመር ትችላላችሁ።. ማንበብ ካልቻሉ የምርት ዝርዝሮችን ለመስማት የማዳመጥ አዝራሩን ብቻ ይጫኑ።. ይህ መድረክ ቀላል፣ ፈጣን እና ለእርስዎ የተሰራ ነው።. አሁን ማሰስ ይጀምሩ!. "
      : tln("lang") === "oromoo"
      ? " እንኳን ደህና መጡ!. ይህ ፕላትፎርም ከአካባቢ ገበሬዎች ትኩስ ምርቶችን በቀጥታ ለመግዛት እና ለመሸጥ ይረዳዎታል።. እቃዎችን መፈለግ ፣ ዋጋዎችን መመልከት እና እቃዎችን ቀላል በሆነ ሁኔታ ወደ ጋሪዎ መጨመር ትችላላችሁ።. ማንበብ ካልቻሉ የምርት ዝርዝሮችን ለመስማት የማዳመጥ አዝራሩን ብቻ ይጫኑ።. ይህ መድረክ ቀላል፣ ፈጣን እና ለእርስዎ የተሰራ ነው።. አሁን ማሰስ ይጀምሩ!. "
      : "Welcome!. This platform helps you buy and sell fresh products directly from local farmers. You can search for products, check prices, and add items to your cart easily. If you cannot read, just press the listen button to hear product details. You can also use the smart AI button to generate and listen to product descriptions automatically. Simple, fast, and made for you. Start exploring now!";

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  /* =========================
     SEARCH (Professional Way)
  ========================== */

  const filteredProducts = useMemo(() => {
    const cleaned = searchTerm.trim().toLowerCase();

    if (!cleaned) return products;

    return products.filter((product) =>
      product.product_name.toLowerCase().includes(cleaned)
    );
  }, [searchTerm, products]);

  /* =========================
     QUANTITY HANDLING
  ========================== */

  const getQty = (id: string) => quantities[id] || 1;

  const increaseQty = (id: string, stock: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(getQty(id) + 1, stock || 1),
    }));
  };

  const decreaseQty = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, getQty(id) - 1),
    }));
  };

  /* =========================
     ACTIONS
  ========================== */

  const handleAddToCart = async (id: string) => {
    setLoadingId(id);
    const result = await addToCart(id, getQty(id));
    setLoadingId(null);

    if (result.success) toast.success(tcc("added"));
    else toast.error(result.message);

    router.refresh();
  };

  const handleBuyNow = (id: string) => {
    alert(`Redirecting to checkout for product ${id}`);
  };

  const handleButton = () => {
    if (user) router.push("/product");
    else router.push("/sign-in");
  };

  /* =========================
  //    VOICE
  // ========================== */
  const speak = (text: string) => {
    const voices = speechSynthesis.getVoices();

    const lang = tln("lang");

    let selectedVoice;

    if (lang === "አማርኛ") {
      selectedVoice = voices.find((v) => v.lang.includes("am"));
    } else if (lang === "oromoo") {
      selectedVoice = voices.find((v) => v.lang.includes("am"));
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      utterance.lang = "en-US"; // fallback
    }

    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  
  // we don't use this when the language of the data from the database is successfully controled
  const speakProductDetail = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  /* =========================
     UI
  ========================== */

  return (
    <div
      className="agri-hero min-h-screen text-foreground transition-colors duration-500"
    >
      {/* HERO */}
      <motion.section
        className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden text-center shadow-inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <img
          src="/cup_coffee.png"
          alt="Premium coffee hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/45 to-primary/35" />

        <motion.h1
          className="relative px-4 text-5xl font-extrabold tracking-tight text-white md:text-7xl"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {tc("greeting")}
        </motion.h1>

        <motion.p
          className="glass-panel relative mt-4 max-w-3xl rounded-2xl p-4 text-lg text-white/95 md:text-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {tc("info")}
        </motion.p>

        <motion.button
          onClick={handleButton}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          className="agri-gradient relative mt-10 flex items-center gap-2 rounded-xl px-8 py-4 font-semibold text-white shadow-xl transition duration-300 hover:scale-[1.02] hover:brightness-110"
        >
          {user ? tc("shopnnowbtn") : tc("signoption")}
          <ArrowRight />
        </motion.button>

        {user && (
          <div>
            {
              role.toUpperCase() === "BUYER" && (
                <LoaderBtn
                className="relative mt-3 bg-transparent text-white hover:text-white/80 hover:underline"
                linkTo={`/${role}`}
                btnName={"Go to Orders"}
              />
              )
            }
            {
              role.toUpperCase() !== "BUYER" && (
                <LoaderBtn
                className="relative mt-3 bg-transparent text-white hover:text-white/80 hover:underline"
                linkTo={`/${role}`}
                btnName={"Go to Orders"}
              />
              )
            }
          </div>
        )}
      </motion.section>

      <button
        className="floating-soft fixed bottom-7 right-3 z-50 flex w-12 items-center justify-center rounded-2xl bg-primary p-3 text-primary-foreground shadow-xl transition-colors hover:bg-primary/85"
        onClick={() => speak(platformDescription)}
      >
        <Volume2 />
      </button>

      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-around p-1"
        >
          <Link
            href="/about"
            className="agri-gradient relative mt-10 flex cursor-pointer items-center gap-2 rounded-xl px-8 py-4 font-semibold text-white shadow-xl"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="agri-gradient relative mt-10 flex cursor-pointer items-center gap-2 rounded-xl px-8 py-4 font-semibold text-white shadow-xl"
          >
            Contact Us
          </Link>
        </motion.div>
      )}
      {/* FEATURED */}
      <section className="px-6 py-20 md:px-20">
        <h2 className="mb-8 flex items-center justify-center gap-2 text-center text-4xl font-bold text-foreground transition-colors">
          <Coffee size={60} className="fill-primary text-primary" />
          {tc("featured")}
        </h2>

        {/* SEARCH INPUT */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder={`${tf("search")}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xl rounded-2xl border border-border/70 bg-background/75 px-5 py-3 text-foreground placeholder:text-muted-foreground shadow-[0_16px_30px_-24px_var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/45 transition-colors"
          />
        </div>

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <p className="mb-10 text-center text-muted-foreground">No products found.</p>
        )}

        {/* PRODUCT GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
              {product.status !== "INACTIVE" && (
                <Card
                  className="h-full overflow-hidden rounded-3xl border border-border/70 bg-card/85 shadow-[0_20px_40px_-30px_var(--foreground)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_30px_55px_-35px_var(--foreground)]"
                >
                  {/* IMAGE */}
                  <div className="relative group">
                    <Link href={`/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.product_name}
                        className="w-full h-52 object-cover transition-all duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    <Button
                      onClick={() => handleBuyNow(product.id)}
                      variant="secondary"
                      className="absolute bottom-3 right-3 rounded-xl border-none bg-accent text-accent-foreground hover:bg-accent/85"
                      disabled={product.stock === 0}
                    >
                      {tb("buy")}
                    </Button>
                  </div>

                  {/* CONTENT */}
                  <CardContent className="p-5 flex flex-col gap-2 flex-grow">
                    <h2 className="text-lg font-semibold">
                      {product.product_name}
                    </h2>

                    <p className="text-2xl font-bold text-primary">
                      {product.price} ETB
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground">
                      <i>{product.product_detail}</i>
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        onClick={() => decreaseQty(product.id)}
                        size="sm"
                        className="rounded-lg bg-red-600 text-white hover:bg-red-500"
                      >
                        -
                      </Button>

                      <span>{getQty(product.id)}</span>

                      <Button
                        onClick={() =>
                          increaseQty(product.id, product.stock || 1)
                        }
                        size="sm"
                        disabled={product.stock === 0}
                        className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/85"
                      >
                        +
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {product.stock > 0
                        ? `${product.stock} Kg left in stock`
                        : "Out of stock"}
                    </p>

                    {reviewData && reviewData?.[product.id]?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="mb-2 text-sm font-semibold text-foreground/80">
                          Reviews ({reviewData[product.id].length})
                        </h3>

                        <div className="max-h-28 overflow-y-auto pr-1 space-y-3">
                          {reviewData[product.id].slice(0, 2).map((r) => (
                            <ReviewCard
                              key={r.id}
                              name={r.name}
                              date={r.date}
                              comment={r.comment || ""}
                              rating={r.rating}
                              isDialog
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  {/* FOOTER */}
                  <CardFooter className="p-5 pt-0 flex flex-col gap-3 mt-auto">
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={loadingId === product.id || product.stock === 0}
                      className="agri-gradient w-full text-white transition duration-300 hover:brightness-110"
                    >
                      <ShoppingCart size={18} />
                      {loadingId === product.id ? tc("adding") : tb("add")}
                    </Button>

                    <Link href={`/product/${product.id}`} className="w-full">
                      <LoaderBtn
                        disable={product.stock === 0}
                        btnName={tb("detail")}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/85"
                      />
                    </Link>
                    <Button
                      onClick={() =>
                        speakProductDetail(product?.product_detail || "")
                      }
                      className="w-full gap-2 rounded-xl bg-card text-foreground transition-colors hover:bg-primary/12"
                    >
                      <Volume2 />
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}




















// // //  PLEASE DO NOT DELETE THE ABOVE CODE. THE BELOW CODE MAY CAUSE ERROR: SO AT THAT TIME YOU SHOULD USE THE ABOVE CODE. IT IS PERFECTILY WORKING CODE WITHOUT DYNAMIC LANGUAGE CONVERSION

// //  PLEASE DO NOT DELETE THE ABOVE CODE. THE BELOW CODE MAY CAUSE ERROR: SO AT THAT TIME YOU SHOULD USE THE ABOVE CODE. IT IS PERFECTILY WORKING CODE WITHOUT DYNAMIC LANGUAGE CONVERSION

// "use client";
// import { useUser } from "@clerk/nextjs";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardFooter } from "../ui/card";
// import { Button } from "../ui/button";
// import { useState, useMemo, useEffect } from "react";
// import { addToCart } from "@/utils/services/cartItem";
// import { ShoppingCart, ArrowRight, Coffee } from "lucide-react";
// import { toast } from "sonner";
// import { useTheme } from "../checkTheme";
// import { Product, Review } from "@prisma/client";
// import LoaderBtn from "../loaderBtn";
// import { useTranslations } from "next-intl";
// import ReviewCard from "../review/ReviewCard";

// import Script from "next/script";

// //////////////////////////

// declare global {
//   interface Window {
//     googleTranslateElementInit: () => void;
//   }

//   const google: any;
// }

// ///////////////////////////

// interface roleProps {
//   role: "ADMIN" | "BUYER" | "SELLER" | "LAB_TECHNICIAN" | "CASHIER" | "/";
//   products: Product[];
//   reviewData?: Record<string, any[]>;
// }

// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.15 },
//   },
// };

// const item = {
//   hidden: { opacity: 0, y: 40 },
//   show: { opacity: 1, y: 0 },
// };

// export default function HomePage({ role, products, reviewData }: roleProps) {
//   const { user } = useUser();
//   const router = useRouter();
//   const tc = useTranslations("home");
//   const tb = useTranslations("button");
//   const tcc = useTranslations("cart");
//   const { language } = useTheme();

//   const [loadingId, setLoadingId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [quantities, setQuantities] = useState<Record<string, number>>({});
//   const [showGoogleLang,setShowGoogleLang] = useState(false);

//   /* =========================
//      SEARCH (Professional Way)
//   ========================== */

//   const filteredProducts = useMemo(() => {
//     const cleaned = searchTerm.trim().toLowerCase();

//     if (!cleaned) return products;

//     return products.filter((product) =>
//       product.product_name.toLowerCase().includes(cleaned)
//     );
//   }, [searchTerm, products]);

//   /* =========================
//      QUANTITY HANDLING
//   ========================== */

//   const getQty = (id: string) => quantities[id] || 1;

//   const increaseQty = (id: string, stock: number) => {
//     setQuantities((prev) => ({
//       ...prev,
//       [id]: Math.min(getQty(id) + 1, stock || 1),
//     }));
//   };

//   const decreaseQty = (id: string) => {
//     setQuantities((prev) => ({
//       ...prev,
//       [id]: Math.max(1, getQty(id) - 1),
//     }));
//   };

//   /* =========================
//      ACTIONS
//   ========================== */

//   const handleAddToCart = async (id: string) => {
//     setLoadingId(id);
//     const result = await addToCart(id, getQty(id));
//     setLoadingId(null);

//     if (result.success) toast.success(tcc("added"));
//     else toast.error(result.message);

//     router.refresh();
//   };

//   const handleBuyNow = (id: string) => {
//     alert(`Redirecting to checkout for product ${id}`);
//   };

//   const handleButton = () => {
//     if (user) router.push("/product");
//     else router.push("/sign-in");
//   };

//   // =========================

//   useEffect(() => {
//     window.googleTranslateElementInit = () => {
//       new google.translate.TranslateElement(
//         {
//           pageLanguage: "en",
//           includedLanguages: "en,om,am",
//           layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
//         },
//         "google_translate_element"
//       );
//     };
//   }, []);

//   function handleShowGoogleLang (){
//     setShowGoogleLang(!showGoogleLang);
//     router.refresh();
//   }

//   // ==========================

//   return (
//     <div
//       className="min-h-screen
//     bg-gradient-to-b
//     from-[#faf7f2] to-[#f4efe7]
//     dark:from-[#1a120b] dark:to-[#0f0a06]
//     text-[#2d1b0f] dark:text-[#f5f5dc]
//     transition-colors duration-500"
//     >

//           <Button onClick={handleShowGoogleLang} className="mt-15 bg-transparent text-green-500 fixed z-50">
//             {showGoogleLang ? "hideGoogleLanguage": "showGoogleLanguage"}
//           </Button>

//       {
//         showGoogleLang && (
//           <div className="fixed z-50">
//           {/* ///////////////////// */}
//           <div id="google_translate_element"></div>

//           <Script
//             src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
//             strategy="afterInteractive"
//           />
//           {/* /////////////////////////////// */}
//         </div>
//         )
//       }

//       {/* HERO */}
//       <motion.section
//         className="relative min-h-[90vh] flex flex-col justify-center items-center text-center bg-[url('/cup_coffee.png')] bg-cover bg-center bg-fixed shadow-inner"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

//         <motion.h1
//           className="relative text-5xl md:text-7xl font-extrabold tracking-wide text-green-800 dark:text-green-400 transition-colors"
//           initial={{ y: -40, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//         >
//           {/* {tc("greeting")} */}
//           Get Ethiopian Green Coffee
//         </motion.h1>

//         <motion.p
//           className="relative mt-4 text-2xl max-w-2xl
//          bg-white/90 dark:bg-[#2b1c12]/90
//          text-green-700 dark:text-green-300
//          p-3 rounded-xl backdrop-blur-md transition-colors"
//           initial={{ y: 40, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//         >
//           {/* {tc("info")} */}
//           Pure Coffee, Low price, from small Ethiopian farmers
//         </motion.p>

//         <motion.button
//           onClick={handleButton}
//           whileHover={{ scale: 1.08 }}
//           whileTap={{ scale: 0.97 }}
//           className="relative mt-10 px-8 py-4 bg-[#6A4325]/90 hover:bg-[#6A4325] text-white font-semibold rounded-xl shadow-xl flex items-center gap-2"
//         >
//           {/* {user ? tc("shopnnowbtn") : tc("signoption")} */}
//           {user ? "Buy Now" : "Sign-In or Sign-Up"}
//           <ArrowRight />
//         </motion.button>

//         {user && (
//           <Link
//             href={`/${role}`}
//             className="relative mt-3 text-white hover:underline"
//           >
//             {/* {tb("dashboardbtn")} */}
//             Goto Dashboard
//           </Link>
//         )}
//       </motion.section>

//       {!user && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 1 }}
//           className=" p-1 flex justify-around"
//         >
//           <Link
//             href="/about"
//             className="relative active:bg-[#6A4325]/30 cursor-pointer mt-10 px-8 py-4 bg-[#6A4325]/90 hover:bg-[#6A4325] text-white font-semibold rounded-xl shadow-xl flex items-center gap-2"
//           >
//             About Us
//           </Link>
//           <Link
//             href="/contact"
//             className="relative cursor-pointer mt-10 px-8 py-4 bg-[#6A4325]/90 active:bg-[#6A4325]/30 hover:bg-[#6A4325] text-white font-semibold rounded-xl shadow-xl flex items-center gap-2"
//           >
//             Contact Us
//           </Link>
//         </motion.div>
//       )}
//       {/* FEATURED */}
//       <section className="py-20 px-6 md:px-20">
//         <h2 className="text-4xl font-bold text-center text-[#4b2e16] dark:text-[#e6ccb2] transition-colors">
//           <Coffee className="text-green-700" />
//           {/* {tc("featured")} */}
//           Featured Coffee Products
//         </h2>

//         {/* SEARCH INPUT */}
//         <div className="flex justify-center mb-10">
//           <input
//             type="text"
//             placeholder="Search product..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full max-w-xl px-5 py-3 rounded-2xl
// bg-white dark:bg-[#2b1c12]
// border border-gray-300 dark:border-[#3c2a21]
// text-black dark:text-[#f5f5dc]
// placeholder:text-gray-500 dark:placeholder:text-gray-400
// shadow-md focus:outline-none
// focus:ring-2 focus:ring-green-600
// transition-colors"
//           />
//         </div>

//         {/* EMPTY STATE */}
//         {filteredProducts.length === 0 && (
//           <p className="text-center text-gray-600 mb-10">No products found.</p>
//         )}

//         {/* PRODUCT GRID */}
//         <motion.div
//           className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
//           variants={container}
//           initial="hidden"
//           animate="show"
//         >
//           {filteredProducts.map((product) => (
//             <motion.div key={product.id} variants={item}>
//               <Card
//                 className="
// rounded-3xl
// shadow-md hover:shadow-xl
// border border-gray-200 dark:border-[#3c2a21]
// hover:border-green-500
// transition-all duration-300
// bg-white dark:bg-[#1f140d]
// overflow-hidden flex flex-col
// transition-colors  h-full"
//               >
//                 {/* IMAGE */}
//                 <div className="relative group">
//                   <Link href={`/product/${product.id}`}>
//                     <img
//                       src={product.image}
//                       alt={product.product_name}
//                       className="w-full h-52 object-cover transition-all duration-300 group-hover:scale-105"
//                       loading="lazy"
//                     />
//                   </Link>

//                   <Button
//                     onClick={() => handleBuyNow(product.id)}
//                     variant="secondary"
//                     className="absolute bottom-3 right-3 bg-blue-700 text-white hover:bg-blue-600"
//                     disabled={product.stock === 0}
//                   >
//                     {/* {tb("buy")} */}
//                     Buy Now
//                   </Button>
//                 </div>

//                 {/* CONTENT */}
//                 <CardContent className="p-5 flex flex-col gap-2 flex-grow">
//                   <h2 className="text-lg font-semibold">
//                     {product.product_name}
//                   </h2>

//                   <p className="text-2xl font-bold text-green-700">
//                     {product.price} Brr
//                   </p>
//                   <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
//                     <i>{product.product_detail}</i>
//                   </p>

//                   <div className="flex items-center gap-2 mt-2">
//                     <Button
//                       onClick={() => decreaseQty(product.id)}
//                       size="sm"
//                       className="bg-red-700 text-white"
//                     >
//                       -
//                     </Button>

//                     <span>{getQty(product.id)}</span>

//                     <Button
//                       onClick={() =>
//                         increaseQty(product.id, product.stock || 1)
//                       }
//                       size="sm"
//                       disabled={product.stock === 0}
//                       className="bg-green-700 text-white"
//                     >
//                       +
//                     </Button>
//                   </div>

//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {product.stock > 0
//                       ? `${product.stock} left in stock`
//                       : "Out of stock"}
//                   </p>

//                   {reviewData && reviewData?.[product.id]?.length > 0 && (
//                     <div className="mt-4">
//                       <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                         Reviews ({reviewData[product.id].length})
//                       </h3>

//                       <div className="max-h-28 overflow-y-auto pr-1 space-y-3">
//                         {reviewData[product.id].slice(0, 2).map((r) => (
//                           <ReviewCard
//                             key={r.id}
//                             name={r.name}
//                             date={r.date}
//                             comment={r.comment || ""}
//                             rating={r.rating}
//                             isDialog
//                           />
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>

//                 {/* FOOTER */}
//                 <CardFooter className="p-5 pt-0 flex flex-col gap-3 mt-auto">
//                   <Button
//                     onClick={() => handleAddToCart(product.id)}
//                     disabled={loadingId === product.id || product.stock === 0}
//                     className="w-full flex items-center justify-center gap-2 bg-[#3c2a21] text-white
//                   hover:bg-[#2b1c12]
//                   dark:bg-[#6f4e37]
//                   dark:hover:bg-[#5a3d2b]
//                   transition-colors"
//                   >
//                     <ShoppingCart size={18} />
//                     {/* {loadingId === product.id ? tc("adding") : tb("add")} */}
//                     {loadingId === product.id ? "Adding..." : "Add to cart"}
//                   </Button>

//                   <Link href={`/product/${product.id}`} className="w-full">
//                     <LoaderBtn
//                       disable={product.stock === 0}
//                       // btnName={tb("detail")}
//                       btnName={"View Detail"}
//                       className="w-full bg-green-600 text-white hover:bg-green-700"
//                     />
//                   </Link>
//                 </CardFooter>
//               </Card>
//             </motion.div>
//           ))}
//         </motion.div>
//       </section>
//     </div>
//   );
// }

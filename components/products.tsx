

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/header";
import { addToCart } from "@/utils/services/cartItem";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTheme } from "./checkTheme";
import LoaderBtn from "./loaderBtn";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ReviewDialog from "./review/reviewDialog";
import { Volume2 } from "lucide-react";

interface Product {
  id: string;
  product_name: string;
  // product_detail?:string;
  image: string;
  price: number;
  stock: number;
  status?: string;
  farmer?: {
    status?: string;
  };
}

interface ProductsProps {
  cartQuantity?: number;
  products: Product[];
  notification?: number;
}

export default function ProductsPage({
  products,
  cartQuantity,
  notification,
}: ProductsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const { language } = useTheme();
  const router = useRouter();

  const tp = useTranslations("products");
  const tb = useTranslations("button");
  const tc = useTranslations("cart");
  const tf = useTranslations("form");
  /* =====================
     SEARCH LOGIC + HIGHLIGHT
  ====================== */
  // const filteredProducts = useMemo(() => {
  //   const cleaned = searchTerm.trim().toLowerCase();
  //   if (!cleaned) return products;

  //   return products.filter((product) =>
  //     product.product_name.toLowerCase().includes(cleaned)
  //   );
  // }, [searchTerm, products]);

  const filteredProducts = useMemo(() => {
    const cleaned = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      if (!cleaned) return true;
      return product.product_name.toLowerCase().includes(cleaned);
    });
  }, [searchTerm, products]);


  const highlightText = (text: string) => {
    const cleaned = searchTerm.trim();
    if (!cleaned) return text;

    const regex = new RegExp(`(${cleaned})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} className="bg-yellow-300 text-black">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };



  if (!products || products.length === 0) {
    return (
      <div className="flex h-screen w-full bg-green-900 text-2xl font-bold text-center items-center justify-center">
        <Header cartQuantity={cartQuantity} />
        <div className="flex flex-col gap-2 text-white">
          {language === "ENGLISH"
            ? "No Products Found!"
            : language === "AFAN_OROMO"
            ? "Oomishni Hin Jiru!"
            : "ምንም ምርቶች አልተገኙም!"}
          <Button
            onClick={() => router.push("/")}
            className="bg-green-600 cursor-pointer font-bold"
          >
            {language === "ENGLISH"
              ? "Back To Home"
              : language === "AFAN_OROMO"
              ? "Deebi'i"
              : "ተመለስ"}
          </Button>
        </div>
      </div>
    );
  }

  /* =====================
     QUANTITY HANDLING
  ====================== */
  const handleQuantityChange = (productId: string, qty: number) => {
    setQuantityMap((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCart = async (product: Product) => {
    const quantity = quantityMap[product.id] || 1;

    if (quantity > product.stock) {
      toast.error(
        language === "ENGLISH"
          ? `Only ${product.stock} left in stock`
          : language === "AFAN_OROMO"
          ? `Qofa ${product.stock} hafe jira`
          : `ብቻ ${product.stock} ቀሩ ነው`
      );
      return;
    }

    setLoadingId(product.id);
    const data = await addToCart(product.id, quantity);

    if (!data?.success) {
      toast.error(data?.message || "Failed to add cart item!");
    } else {
      toast.success(tc("added"));
    }
    setLoadingId(null);
    router.refresh();
  };

  const handleBuyNow = (product: Product) => {
    alert(
      language === "ENGLISH"
        ? `Redirecting to checkout for ${product.product_name}`
        : language === "AFAN_OROMO"
        ? `${product.product_name} gara kaffaltii deemaa jirta`
        : `${product.product_name} ወደ ክፍያ ተመልሷል`
    );
  };



    /* =========================
     VOICE
  ========================== */
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };


  /* =====================
     UI
  ====================== */

  return (
    <div
      className="
        min-h-screen mt-5 px-4 md:px-12 py-16
        bg-gradient-to-b 
        from-[#faf7f2] to-[#f4efe7]
        dark:from-[#1a120b] dark:to-[#0f0a06]
        text-[#2d1b0f] dark:text-[#f5f5dc]
        transition-colors duration-500
      "
    >
      <Header notification={notification} cartQuantity={cartQuantity} />
  
      <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">
        {tp("title")}
      </h1>
  
      {/* SEARCH INPUT */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder={tf("search" )}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full max-w-xl px-5 py-3 rounded-2xl
            bg-white dark:bg-[#2b1c12]
            border border-gray-300 dark:border-[#3c2a21]
            text-black dark:text-[#f5f5dc]
            placeholder:text-gray-500 dark:placeholder:text-gray-400
            shadow-md focus:outline-none
            focus:ring-2 focus:ring-green-600
            transition-colors duration-300
          "
        />
      </div>
  
      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
          No products found.
        </p>
      )}
  
      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
              <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <Card
                className={`
                  h-full flex flex-col
                  rounded-3xl overflow-hidden
                  shadow-md hover:shadow-xl
                  border border-gray-200 dark:border-[#3c2a21]
                  bg-white dark:bg-[#1f140d]
                  transition-all duration-300
                  ${
                    product.stock === 0
                      ? "opacity-80 border-red-400 dark:border-red-600"
                      : "hover:border-green-600"
                  }
                `}
              >
                <CardContent className="p-4 flex flex-col gap-3 flex-grow">
                  <Link href={`product/${product.id}`} className="cursor-pointer">
                    <div className="relative group overflow-hidden rounded-xl">
                      <img
                        src={`${product.image}`}
                        alt={product.product_name || "Product image"}
                        className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>
    
                  <h2 className="text-lg font-semibold">
                    {highlightText(product.product_name)}
                  </h2>
    
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {product.price} ETB
                  </p>
    
                  {/* Quantity + Stock */}
                  <div className="flex items-center justify-between mt-2">
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantityMap[product.id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product.id, Number(e.target.value))
                      }
                      className="
                        w-20 p-1 rounded-md text-center
                        bg-white dark:bg-[#2b1c12]
                        border border-gray-300 dark:border-[#3c2a21]
                        text-black dark:text-[#f5f5dc]
                        transition-colors
                      "
                    />
    
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {product.stock === 0
                        ? "Finished Product!"
                        : language === "ENGLISH"
                        ? `Stock: ${product.stock} Kg left`
                        : language === "AFAN_OROMO"
                        ? `Qabeenya: ${product.stock}`
                        : `እቃ ቀሪ: ${product.stock}`}  
                    </span>
                  </div>
  
                </CardContent>
                {/* <i>{product.product_detail}</i> */}

                {/* FOOTER */}
                <CardFooter className="flex flex-col gap-3 p-4 mt-auto">
                  <div className="flex flex-wrap justify-between items-center w-full gap-2">
                    <Button
                      className="
                        flex-1 rounded-xl
                        bg-[#3c2a21] text-white
                        hover:bg-[#2b1c12]
                        dark:bg-[#6f4e37]
                        dark:hover:bg-[#5a3d2b]
                        transition-colors
                      "
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        loadingId === product.id || product.stock === 0
                      }
                    >
                      {loadingId === product.id ? "loading..." : product.stock === 0 ? "Out of Stock" : tb("add")}
                    </Button>
                    <LoaderBtn
                      btnName={tb("detail")}
                      linkTo={`/product/${product.id}`}
                      className="
                        flex-1 rounded-xl
                        bg-green-600 text-white font-bold
                        hover:bg-green-700
                        dark:bg-green-700 dark:hover:bg-green-800
                      "
                    />
  
                    {/* <Button onClick={()=>speak(product.product_detail || "")}><Volume2 /></Button> */}
                  </div>
                </CardFooter>
    
                {/* BUY BUTTON */}
  
              </Card>
            </motion.div>
        ))}
      </div>
    </div>
  );

}

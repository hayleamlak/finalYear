

"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion";
import { Heart, Leaf, Star } from "lucide-react";
import { useState } from "react";
import { addToCart } from "@/utils/services/cartItem";
import { toast } from "sonner";
import { useTheme as LanguageTheme } from "./checkTheme";
import Header from "./header";
import LoaderBtn from "./loaderBtn";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import FarmLocationMap from "./farmer/FarmLocationMap";
import AddProduct from "./form/add-product";

export default function ProductById({ product, isDashboard,cartQuantity,notification}: { product: any; isDashboard?: boolean, cartQuantity?:number,notification?:number}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const router = useRouter();

  const userInfo = useUser();
  const [isYou,setIsYou] = useState(product.farmer.id===userInfo?.user?.id ? true:false);


  const { language } = LanguageTheme();
  const lang = language;

  const handleAddToCart = async () => {
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
      toast.success(
        language === "ENGLISH"
          ? "Product Added to Cart Successfully!"
          : language === "AFAN_OROMO"
          ? "Oomisha Kuusaatti Dabaleera!"
          : "ምርቱ ወደ ግዢው ቅርጫት ተጨምሯል!"
      );
    }
    setLoadingId(null);
    router.refresh();
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto p-6"
    >
      <Header notification={notification} cartQuantity={cartQuantity} />
  
      <Card className="shadow-2xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-5">
        <CardHeader className="border-b bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 py-6">
          <CardTitle className="text-4xl font-bold text-center flex items-center justify-center gap-2 dark:text-white">
            <Leaf className="text-green-600 dark:text-green-300" size={32} />
            {language === "ENGLISH"
              ? " Product Details"
              : language === "AFAN_OROMO"
              ? " Bal'ina oomishaa"
              : language === "AMHARIC"
              ? "የምርት ዝርዝር"
              : ""}
          </CardTitle>
        </CardHeader>
  
        <CardContent className="p-8 grid gap-10 md:grid-cols-2 items-start">
          {/* PRODUCT IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src={product?.image || "/globe.svg"}
              alt="product image"
              className="w-full h-80 object-cover rounded-2xl shadow-md border dark:border-gray-600"
            />
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-700 shadow-md rounded-full p-2">
              <Star className="text-yellow-500 hover:fill-amber-400" />
            </div>
          </motion.div>
  
          {/* PRODUCT INFO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-extrabold text-green-700 dark:text-green-300">
                {product?.price} ETB
              </h1>
              <h2 className="text-2xl font-semibold mt-2 dark:text-white">
                {product?.product_name}
              </h2>
  
              {!isDashboard && (
                <div className="flex flex-col items-center bg-gray-400 dark:bg-gray-700 p-2 max-w-75 rounded-2xl gap-1 mt-2">
                  <div className="flex justify-center items-center">
                    <div className="bg-pink-400 dark:bg-pink-600 p-2 rounded-full text-green-600 dark:text-green-300 font-bold">
                      {product?.farmer?.first_name.charAt(0)}
                      {product?.farmer?.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-200 text-md mt-1">
                        Farmer: <span className="font-medium">{product?.farmer?.first_name} {product?.farmer?.last_name}</span>
                      </p>
                    </div>
                  </div>
  
                  <div className="bg-green-800 dark:bg-green-600 p-1 rounded w-full text-pink-400 dark:text-pink-200 font-bold">
                    {
                      isYou && (
                        <h1 className="text-center">This is your own Product</h1>
                      )
                    }
                    {
                      !isYou && (
                        <LoaderBtn
                        btnName="Goto Chat"
                        linkTo={`/chatMatche/${product.farmer.id}`}
                        className="w-full"
                      />
                      )
                    }
                  </div>
  
                  <LoaderBtn
                    btnName="Farmer Profile"
                    className="bg-green-800 dark:bg-green-600 p-1 rounded w-full text-pink-400 dark:text-pink-200 font-bold"
                    linkTo={`/profile/${product.farmer.id}`}
                  />
                </div>
              )}
            </div>
  
            {/* DETAILS */}
            {((product?.category || "").toLowerCase() !== "coffee") && (
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
                {product?.product_detail || "No detailed description available."}
              </p>
            )}
  
            <p className="text-gray-700 dark:text-gray-200 text-md">
              <span className="font-semibold">Status:</span> {product?.status}
            </p>
  
            {/* Actions */}
            {!isDashboard && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24 p-2 border rounded-xl text-center dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <span className="text-sm text-gray-500 dark:text-gray-300 self-center">
                  {language === "ENGLISH"
                    ? `Stock: ${product.stock}` 
                    : language === "AFAN_OROMO"
                    ? `Qabeenya: ${product.stock}`
                    : `እቃ ቀሪ: ${product.stock}`} Kg
                </span>
  
                <Button className="flex items-center gap-2 rounded-xl px-6 py-3 text-base shadow-md hover:shadow-lg">
                  <Heart size={18} />
                  {language === "ENGLISH"
                    ? " Add to Wishlist "
                    : language === "AFAN_OROMO"
                    ? " Tarree fedhitti dabali"
                    : "ወደ ፍላጎት ዝርዝር ጨምር"}
                </Button>
  
                <Button
                  className="rounded-xl cursor-pointer bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800"
                  onClick={handleAddToCart}
                  disabled={loadingId === product.id}
                >
                  {loadingId === product.id
                    ? language === "ENGLISH"
                      ? "Adding..."
                      : language === "AFAN_OROMO"
                      ? "Dabalaa Jira..."
                      : "እየጨመሩ ነው..."
                    : language === "ENGLISH"
                    ? "Add to Cart"
                    : language === "AFAN_OROMO"
                    ? "Kuusaatti Dabali"
                    : "ወደ ግዢው ቅርጫት ጨምር"}
                </Button>
  
                <Button
                  className="rounded-xl bg-blue-600 dark:bg-blue-700 text-white font-bold"
                  onClick={() => alert("Redirecting to checkout")}
                >
                  {language === "ENGLISH"
                    ? "Buy Now"
                    : language === "AFAN_OROMO"
                    ? "Amma Biti"
                    : "አሁን ግዛ"}
                </Button>
              </div>
            )}
  
            {isDashboard && (
              // <Button className="rounded-xl cursor-pointer bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800">
              //   Edit
              // </Button>
              <AddProduct isEdit={true} product={product} />
            )}
          </motion.div>
        </CardContent>
        <CardFooter className="border-t bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 py-4">

            {product?.farmer?.latitude && product?.farmer?.longitude && (
              <div className="w-full z-0">
                <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">Farm Location</h2>  
                <FarmLocationMap
                  latitude={product.farmer.latitude}
                  longitude={product.farmer.longitude}
                  farmerName={`${product.farmer.first_name} ${product.farmer.last_name}'s Farm`}
                />
              </div>
            )}
            {!product?.farmer?.latitude && !product?.farmer?.longitude && (
              <p className="text-center text-gray-500 dark:text-gray-300">Farm location not available. You can Inform the farmer to add the exact Location of His/Her Product <i>(Go To chat and Inform Him/Her)</i></p>
            )}

        </CardFooter>
      </Card>
    </motion.div>
  );
}

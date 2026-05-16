

import Header from "@/components/header";
import HomePage from "@/components/home-components/home";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAllProducts } from "./actions/products";
import { getCartByUserIdForCartQuantity } from "@/utils/services/cart";
import { getAllUnreadNotifications } from "@/utils/services/notification";
import { getReviewsByProductId } from "./actions/review";

export default async function Home() {
  const { userId, sessionClaims } = await auth();

  let cartQuantity = 0;
  let role = undefined;
  let unreadCount = 0;

  let user = null;

  //  Only run user logic if logged in
  if (userId) {
    user = await currentUser();

    if (user) {
      const cart = await getCartByUserIdForCartQuantity(userId);

      cart?.items?.forEach((item) => {
        cartQuantity += item.quantity;
      });

      const unread = await getAllUnreadNotifications();
      unreadCount = unread?.data?.length ?? 0;

      role = sessionClaims?.metadata?.role;

      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        "";

      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email,
          address: "",
          first_name: user.firstName || "",
          last_name: user.lastName || "",
          role: "BUYER",
        },
      });
    }
  }

  const productsData = await getAllProducts();

  // pages/index.tsx or app/page.tsx

  const products = productsData.data ?? [];

  // Fetch reviews for each product
  const reviewsMap: Record<string, Awaited<ReturnType<typeof getReviewsByProductId>>> = {};

  for (const product of products) {
    const reviews = await getReviewsByProductId(product.id);
    reviewsMap[product.id] = reviews;
  }

  if (!productsData) {
    return <div>No products found</div>;
  }

  const unread = await getAllUnreadNotifications();

  return (
    <div className="pt-24 md:pt-28">
      <Header notification={unread?.data?.length} cartQuantity={cartQuantity} />
      {/* <HomePage products={productsData.data ?? []} role={role || "/"} /> */}
      <HomePage
        products={products}
        role={role || "/"}
        reviewData={reviewsMap}
      />
    </div>
  );
}

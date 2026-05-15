
import { Roles } from "@/types/global";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();

  return (
    sessionClaims?.metadata?.role === role.toLowerCase() ||
    sessionClaims?.public_metadata?.role === role.toLowerCase() ||
    sessionClaims?.unsafe_metadata?.role === role.toLowerCase()
  );
};


export const getRole = async () => {
  const { sessionClaims } = await auth();

  const role =
    sessionClaims?.metadata?.role?.toLowerCase() ||
    sessionClaims?.public_metadata?.role?.toLowerCase() ||
    sessionClaims?.unsafe_metadata?.role?.toLowerCase() ||
    "buyer";

  return role;
};
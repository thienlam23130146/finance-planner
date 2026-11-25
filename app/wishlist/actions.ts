"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import * as z from "zod";
import {
  readValues,
  wishlistSchema,
  type WishlistFormState,
} from "@/lib/validation";

export async function createWishlistItem(
  _prev: WishlistFormState,
  formData: FormData,
): Promise<WishlistFormState> {
  const user = await requireUser();
  const values = readValues(formData);
  const parsed = wishlistSchema.safeParse(values);

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return { errors: flat.fieldErrors, values };
  }

  await prisma.wishlistItem.create({
    data: {
      ...parsed.data,
      userId: user.id,
    },
  });

  revalidatePath("/wishlist");
  return { ok: true, message: "Đã thêm vào Wishlist" };
}

export async function deleteWishlistItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  await prisma.wishlistItem.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/wishlist");
}

export async function purchaseWishlistItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  const item = await prisma.wishlistItem.findFirst({
    where: { id, userId: user.id },
  });
  if (!item) return;

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        amount: item.cost,
        description: `Mua wishlist: ${item.name}`,
        category: "OTHER",
        date: new Date(),
      },
    }),
    prisma.wishlistItem.delete({
      where: { id: item.id },
    }),
  ]);

  revalidatePath("/wishlist");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
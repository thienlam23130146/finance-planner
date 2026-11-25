"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import * as z from "zod";
import {
  readValues, 
  transactionSchema, 
  type FormState,
} from "@/lib/validation";

export async function createTransaction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const values = readValues(formData);
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return { errors: flat.fieldErrors, values };
  }
  await prisma.transaction.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date), // chuỗi → Date
      userId: user.id, // chủ sở hữu lấy từ session
    },
  });
  revalidatePath("/transactions");
  return { ok: true, message: "Đã thêm giao dịch" };
}

export async function deleteTransaction(
  formData: FormData,
) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  // Chống IDOR: id đến từ form (sửa được bằng DevTools)
  // → luôn lọc thêm userId của người đang đăng nhập
  await prisma.transaction.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath("/transactions");
}
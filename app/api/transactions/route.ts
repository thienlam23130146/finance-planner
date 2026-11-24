import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDateRange } from "@/lib/finance";
import { transactionFilterSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const parsed = transactionFilterSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Tham số lọc không hợp lệ" },
      { status: 400 },
    );
  }
  const { range, ...rest } = parsed.data;
  const rows = await prisma.transaction.findMany({
    where: { date: getDateRange(range), ...rest },
    orderBy: { date: "desc" },
  });
  return Response.json(rows);
}
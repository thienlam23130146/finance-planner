import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { formatVND } from "@/lib/finance";
import { ExpensePieChart } from "./expense-pie-chart";
import { WishlistProgress } from "./wishlist-progress";
import { SignOutButton } from "../transactions/sign-out-button";

export default async function DashboardPage() {
  const user = await requireUser();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [monthlyExpenses, totalIncome, totalExpense, wishlistItems] =
    await Promise.all([
      prisma.transaction.groupBy({
        by: ["category"],
        _sum: { amount: true },
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { userId: user.id, type: "INCOME" },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { userId: user.id, type: "EXPENSE" },
      }),
      prisma.wishlistItem.findMany({
        where: { userId: user.id },
        orderBy: [{ priority: "desc" }, { cost: "asc" }],
      }),
    ]);

  const balance =
    (totalIncome._sum.amount ?? 0) - (totalExpense._sum.amount ?? 0);

  const expenseChartData = monthlyExpenses.map((row) => ({
    category: row.category,
    amount: row._sum.amount ?? 0,
  }));

  return (
    <main className="mx-auto grid max-w-2xl gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan tài chính</h1>
          <p className="text-sm text-muted-foreground">
            Số dư hiện tại: <strong>{formatVND(balance)}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions" className="rounded border px-3 py-1 text-sm">
            Giao dịch
          </Link>
          <Link href="/wishlist" className="rounded border px-3 py-1 text-sm">
            Wishlist
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpensePieChart data={expenseChartData} />
        <WishlistProgress items={wishlistItems} balance={balance} />
      </div>
    </main>
  );
}
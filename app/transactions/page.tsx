import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { formatVND, getDateRange } from "@/lib/finance";
import { transactionFilterSchema } from "@/lib/validation";
import { TransactionForm } from "./transaction-form";
import { TransactionFilters } from "./transaction-filters";
import { deleteTransaction } from "./actions";
import { SignOutButton } from "./sign-out-button";

export default async function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  // Next 16: searchParams là Promise → phải await
  // URL sai (?type=abc) → về bộ lọc mặc định
  // chưa đăng nhập → requireUser chuyển tới /login
  const user = await requireUser();
  const filter = transactionFilterSchema
    .catch({ range: "this-month" })
    .parse(await searchParams);
  const rows = await prisma.transaction.findMany({
    where: {
      userId: user.id, // chỉ giao dịch của chính mình
      date: getDateRange(filter.range),
      type: filter.type,
      category: filter.category,
    },
    orderBy: { date: "desc" },
  });
  return (
    <main className="grid max-w-md gap-4 p-8">
      <p>Xin chào {user.name} ({user.email})</p>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Giao dịch</h1>
        <SignOutButton />
      </div>
      <TransactionForm />
      <TransactionFilters {...filter} />
      <p>{rows.length} giao dịch</p>
      <ul>
        {rows.map((t) => (
          <li key={t.id}>
            {t.description}: {formatVND(t.amount)}
            <form action={deleteTransaction}>
              <input type="hidden" name="id"
                value={t.id} />
              <button>Xoá</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
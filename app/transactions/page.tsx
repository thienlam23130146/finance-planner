import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/finance";
export default async function TransactionsPage() {
  const rows = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return (
    <main className="grid max-w-md gap-4 p-8">
      <p>{rows.length} giao dịch</p>
      <ul>
        {rows.map((t) => (
          <li key={t.id}>
            {t.description}: {formatVND(t.amount)}
          </li>
        ))}
      </ul>
    </main>
  );
}
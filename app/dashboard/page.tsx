import { prisma } from '@/lib/prisma';
import { formatVND } from '@/lib/finance';

export default async function DashboardPage() {
  const [thu, chi, theo] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENSE' },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: { type: 'EXPENSE' },
      orderBy: { _sum: { amount: 'desc' } },
    }),
  ]);

    const soDu = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);

    return (
    <main className="p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Tổng thu: {formatVND(thu._sum.amount ?? 0)}</p>
        <p>Tổng chi: {formatVND(chi._sum.amount ?? 0)}</p>
        <p className="font-bold">
        Số dư: {formatVND(soDu)}
        </p>
        <ul className="mt-4">
        {theo.map((d) => (
            <li key={d.category}>
            {d.category}: {formatVND(d._sum.amount ?? 0)}
            </li>
        ))}
        </ul>
    </main>
    );
}
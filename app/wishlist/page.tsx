import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { formatVND } from "@/lib/finance";
import { WishlistForm } from "./wishlist-form";
import { deleteWishlistItem, purchaseWishlistItem } from "./actions";

const PRIORITY_BADGE: Record<string, string> = {
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

export default async function WishlistPage() {
  const user = await requireUser();

  const [items, thu, chi] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "INCOME" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "EXPENSE" },
    }),
  ]);

  const soDu = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);
  const tongWishlist = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <main className="grid max-w-md gap-4 p-8">
      <h1 className="text-2xl font-bold">Wishlist</h1>

      <div className="rounded border p-3 text-sm">
        <p>
          Số dư hiện có: <strong>{formatVND(soDu)}</strong>
        </p>
        <p>
          Tổng mục tiêu ({items.length} món):{" "}
          <strong>{formatVND(tongWishlist)}</strong>
        </p>
      </div>

      <WishlistForm />

      <ul className="grid gap-2">
        {items.map((item) => {
          const duTien = soDu >= item.cost;
          return (
            <li
              key={item.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm">
                  {formatVND(item.cost)} · Ưu tiên:{" "}
                  {PRIORITY_BADGE[item.priority]}
                </p>
                <p
                  className={`text-xs ${duTien ? "text-green-600" : "text-amber-600"}`}
                >
                  {duTien
                    ? "Đủ số dư để mua"
                    : `Còn thiếu ${formatVND(item.cost - soDu)}`}
                </p>
              </div>

              <div className="flex gap-2">
                <form action={purchaseWishlistItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    className="rounded border px-2 py-1 text-xs"
                    title="Ghi nhận chi tiêu và xóa khỏi wishlist"
                  >
                    Đã mua
                  </button>
                </form>

                <form action={deleteWishlistItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="rounded border px-2 py-1 text-xs text-red-600">
                    Xóa
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
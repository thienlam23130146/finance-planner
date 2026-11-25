import Link from "next/link";
import { Priority } from "@/generated/prisma/enums";
import { formatVND } from "@/lib/finance";

type WishlistProgressItem = {
  id: string;
  name: string;
  cost: number;
  priority: Priority;
};

const PRIORITY_TEXT: Record<Priority, string> = {
  HIGH: "Ưu tiên cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

export function WishlistProgress({
  items,
  balance,
}: {
  items: WishlistProgressItem[];
  balance: number;
}) {
  const safeBalance = Math.max(0, balance);

  return (
    <section
      aria-labelledby="wishlist-progress-heading"
      className="rounded-lg border p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 id="wishlist-progress-heading" className="font-semibold">
          Tiến độ Wishlist
        </h2>
        <Link
          href="/wishlist"
          className="text-xs underline hover:text-foreground/80"
        >
          Quản lý ({items.length})
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có mục tiêu nào trong Wishlist.
        </p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => {
            const percent = Math.min(
              100,
              Math.round((safeBalance / item.cost) * 100),
            );
            const reached = balance >= item.cost;

            return (
              <li key={item.id} className="grid gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {item.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({PRIORITY_TEXT[item.priority]})
                    </span>
                  </span>
                  <span className="text-xs font-medium">
                    {percent}% · {formatVND(item.cost)}
                  </span>
                </div>

                {/* Thanh tiến độ chuẩn ARIA */}
                <div
                  role="progressbar"
                  aria-label={`Tiến độ mua ${item.name}`}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 w-full overflow-hidden rounded-full bg-secondary"
                >
                  <div
                    className={`h-full transition-all ${
                      reached ? "bg-green-600" : "bg-primary"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {reached
                    ? "Đã đủ số dư để mua"
                    : `Còn thiếu ${formatVND(item.cost - safeBalance)}`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
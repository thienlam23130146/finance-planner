"use client";

import { Pie, PieChart } from "recharts";
import { Category } from "@/generated/prisma/enums";
import { formatVND } from "@/lib/finance";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type CategoryExpenseItem = {
  category: Category;
  amount: number;
};

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  FOOD: { label: "Ăn uống", color: "#f97316" }, 
  TRANSPORT: { label: "Di chuyển", color: "#3b82f6" }, 
  SALARY: { label: "Lương", color: "#22c55e" },  
  OTHER: { label: "Khác", color: "#a855f7" },
};

const chartConfig = {
  amount: { label: "Số tiền" },
  FOOD: { label: CATEGORY_META.FOOD.label, color: CATEGORY_META.FOOD.color },
  TRANSPORT: {
    label: CATEGORY_META.TRANSPORT.label,
    color: CATEGORY_META.TRANSPORT.color,
  },
  SALARY: {
    label: CATEGORY_META.SALARY.label,
    color: CATEGORY_META.SALARY.color,
  },
  OTHER: { label: CATEGORY_META.OTHER.label, color: CATEGORY_META.OTHER.color },
} satisfies ChartConfig;

export function ExpensePieChart({ data }: { data: CategoryExpenseItem[] }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (total === 0) {
    return (
      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">Tỉ lệ chi tiêu tháng này</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Chưa có khoản chi nào trong tháng hiện tại.
        </p>
      </section>
    );
  }

  const chartData = data.map((item) => ({
    category: item.category,
    label: CATEGORY_META[item.category].label,
    amount: item.amount,
    fill: CATEGORY_META[item.category].color,
    percent: Math.round((item.amount / total) * 100),
  }));

  return (
    <section
      aria-labelledby="expense-chart-heading"
      className="rounded-lg border p-4"
    >
      <div className="mb-2 flex items-baseline justify-between">
        <h2 id="expense-chart-heading" className="font-semibold">
          Tỉ lệ chi tiêu tháng này
        </h2>
        <span className="text-sm text-muted-foreground">
          Tổng chi: {formatVND(total)}
        </span>
      </div>

      {/* Biểu đồ trực quan (ẩn khỏi screen reader để tránh đọc nhiễu SVG) */}
      <div aria-hidden="true">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-65"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="category"
                  formatter={(value) => formatVND(Number(value))}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={55}
              strokeWidth={2}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
      </div>

      {/* Bảng số liệu thay thế dành riêng cho trình đọc màn hình */}
      <table className="sr-only">
        <caption>
          Bảng chi tiết tỉ lệ chi tiêu theo danh mục trong tháng hiện tại (Tổng:{" "}
          {formatVND(total)})
        </caption>
        <thead>
          <tr>
            <th scope="col">Danh mục</th>
            <th scope="col">Số tiền</th>
            <th scope="col">Tỉ lệ</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((row) => (
            <tr key={row.category}>
              <th scope="row">{row.label}</th>
              <td>{formatVND(row.amount)}</td>
              <td>{row.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
"use client";
import { useActionState } from "react";
import { Category } from "@/generated/prisma/enums";
import { createTransaction } from "./actions";

export function TransactionForm() {
  const [state, formAction, pending] =
    useActionState(createTransaction, {});
  const { values: v = {}, errors: err = {} } = state;
  return (
    <form action={formAction} className="grid gap-2">
      <select name="type" aria-label="Loại"
        defaultValue={v.type ?? "EXPENSE"}>
        <option value="EXPENSE">Chi</option>
        <option value="INCOME">Thu</option>
      </select>
      <input name="amount" placeholder="Số tiền (VND)"
        defaultValue={v.amount} />
      <Err msg={err.amount} />
            <input name="description" placeholder="Mô tả"
        defaultValue={v.description} />
      <Err msg={err.description} />
      <select name="category" aria-label="Danh mục"
        defaultValue={v.category ?? "FOOD"}>
        {Object.values(Category).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input name="date" type="date" aria-label="Ngày"
        defaultValue={v.date} />
      <Err msg={err.date} />
      <button disabled={pending}>Thêm</button>
      {state.ok && <output>{state.message}</output>}
    </form>
  );
}
const Err = ({ msg }: { msg?: string[] }) => msg &&
  <p role="alert" className="text-red-600">{msg[0]}</p>;
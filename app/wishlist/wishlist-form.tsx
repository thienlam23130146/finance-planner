"use client";

import { useActionState } from "react";
import { Priority } from "@/generated/prisma/enums";
import { createWishlistItem } from "./actions";

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

export function WishlistForm() {
  const [state, formAction, pending] = useActionState(
    createWishlistItem,
    {},
  );
  const { values: v = {}, errors: err = {} } = state;

  return (
    <form action={formAction} className="grid gap-2">
      <input
        name="name"
        placeholder="Tên món đồ muốn mua"
        defaultValue={v.name}
      />
      <Err msg={err.name} />

      <input
        name="cost"
        placeholder="Giá dự kiến (VND)"
        defaultValue={v.cost}
      />
      <Err msg={err.cost} />

      <select
        name="priority"
        aria-label="Mức ưu tiên"
        defaultValue={v.priority ?? "MEDIUM"}
      >
        {Object.values(Priority).map((p) => (
          <option key={p} value={p}>
            Ưu tiên: {PRIORITY_LABEL[p]}
          </option>
        ))}
      </select>
      <Err msg={err.priority} />

      <button disabled={pending}>
        {pending ? "Đang thêm..." : "Thêm vào Wishlist"}
      </button>
      {state.ok && <output className="text-green-600">{state.message}</output>}
    </form>
  );
}

const Err = ({ msg }: { msg?: string[] }) =>
  msg && (
    <p role="alert" className="text-red-600">
      {msg[0]}
    </p>
  );
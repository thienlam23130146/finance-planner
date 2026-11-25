"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="rounded border px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
    >
      {pending ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
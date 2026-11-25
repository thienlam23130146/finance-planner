"use client";
import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const label = isSignUp ? "Đăng ký" : "Đăng nhập";

  async function handleSubmit(
    e: SubmitEvent<HTMLFormElement>,
  ) {
    e.preventDefault(); // không xoá form khi báo lỗi
    const data = new FormData(e.currentTarget);
    const input = {
      email: String(data.get("email")),
      password: String(data.get("password")),
      name: String(data.get("name") ?? ""),
    };
    const { error } = isSignUp
      ? await authClient.signUp.email(input)
      : await authClient.signIn.email(input);
    if (error) return setError(error.message ?? "Lỗi");
    router.push("/transactions");
  }

  return (
    <form onSubmit={handleSubmit}
      className="grid max-w-sm gap-2 p-8">
      <h1 className="text-2xl font-bold">{label}</h1>
      {isSignUp && (
        <input name="name" placeholder="Tên" />
      )}
      <input name="email" placeholder="Email" />
      <input name="password" type="password"
        placeholder="Mật khẩu (≥ 8 ký tự)" />
      {error && <p role="alert">{error}</p>}
      <button>{label}</button>
      <button type="button"
        onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Đã có tài khoản" : "Tạo tài khoản"}
      </button>
    </form>
  );
}
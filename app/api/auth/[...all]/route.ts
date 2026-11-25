import { toNextJsHandler } from
  "better-auth/next-js";
import { auth } from "@/lib/auth";

// Xử lý mọi request /api/auth/*
// (đăng ký, đăng nhập, OAuth, session...)
export const { GET, POST } = toNextJsHandler(auth);
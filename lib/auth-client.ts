import { createAuthClient } from "better-auth/react";

// Gọi /api/auth/* cùng domain – không cần baseURL
export const authClient = createAuthClient();
import type { MiddlewareHandler } from "hono";

interface Env {
  Variables: {
    userId: string;
  };
}

export const requireAuth: MiddlewareHandler<Env> = async (c, next) => {
  const token = c.req.header("Authorization");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // verify token

  // get user from token
  const userId = "123456789";
  c.set("userId", userId);

  await next();
};

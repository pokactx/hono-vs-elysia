import { handle } from "hono/vercel";

import { route } from "@/lib/platforms/hono/app";

export const GET = handle(route);
export const POST = handle(route);
export const PUT = handle(route);
export const DELETE = handle(route);

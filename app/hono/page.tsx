"use client";

import Link from "next/link";
import { Suspense } from "react";

import { TodoApp } from "@/components/todo-app";
import { honoApi } from "@/lib/platforms/hono/api";

export default function HonoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Hono TODO</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Home
            </Link>
            <a
              href="/api/hono/ui"
              target="_blank"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Swagger UI
            </a>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <TodoApp api={honoApi} queryKey="hono" />
        </Suspense>
      </div>
    </div>
  );
}

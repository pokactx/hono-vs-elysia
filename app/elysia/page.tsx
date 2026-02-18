"use client";

import Link from "next/link";
import { Suspense } from "react";

import { TodoApp } from "@/components/todo-app";
import { elysiaApi } from "@/lib/platforms/elysia/api";

export default function ElysiaPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Elysia TODO</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Home
            </Link>
            <a
              href="/api/elysia/openapi"
              target="_blank"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              OpenAPI UI
            </a>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <TodoApp api={elysiaApi} queryKey="elysia" />
        </Suspense>
      </div>
    </div>
  );
}

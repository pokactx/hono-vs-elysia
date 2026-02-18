import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Hono vs Elysia
        </h1>
        <p className="text-center text-zinc-500">Two TODO apps, two frameworks, same frontend.</p>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/hono"
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
          >
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Hono</span>
            <span className="text-sm text-zinc-500">
              Lightweight, Web Standards-based framework with OpenAPI via @hono/zod-openapi
            </span>
          </Link>
          <Link
            href="/elysia"
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
          >
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Elysia</span>
            <span className="text-sm text-zinc-500">
              Bun-native framework with end-to-end type safety and built-in Swagger
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}

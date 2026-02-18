import { treaty } from "@elysiajs/eden";

import type { CreateTodoDto, UpdateTodoDto } from "@/lib/schemas";
import type { TodoApi } from "@/lib/todo-store";

import type { AppType } from "./app";

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const { api } = treaty<AppType>(getBaseUrl());

export const elysiaApi: TodoApi = {
  create: async (body: CreateTodoDto) => {
    const { data, error } = await api.elysia.todos.post(body);
    if (error) {
      throw new Error("Failed to create todo");
    }
    return data;
  },
  delete: async (id: string) => {
    const { error } = await api.elysia.todos({ id }).delete();
    if (error) {
      throw new Error("Failed to delete todo");
    }
  },
  get: async (id: string) => {
    const { data, error } = await api.elysia.todos({ id }).get();
    if (error) {
      throw new Error("Failed to fetch todo");
    }
    return data;
  },
  list: async () => {
    const { data, error } = await api.elysia.todos.get();
    if (error) {
      throw new Error("Failed to fetch todos");
    }
    return data;
  },
  update: async (id: string, body: UpdateTodoDto) => {
    const { data, error } = await api.elysia.todos({ id }).put(body);
    if (error) {
      throw new Error("Failed to update todo");
    }
    return data;
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/elysia/file-upload", {
      body: formData,
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Failed to upload file");
    }
    return res.json();
  },
};

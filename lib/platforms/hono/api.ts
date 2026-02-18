import { hc } from "hono/client";

import type { CreateTodoDto, UpdateTodoDto } from "@/lib/schemas";
import type { TodoApi } from "@/lib/todo-store";

import type { AppType } from "./app";

const rpcClient = hc<AppType>("/");

export const honoApi: TodoApi = {
  create: async (data: CreateTodoDto) => {
    const res = await rpcClient.api.hono.todos.$post({ json: data });
    if (!res.ok) {
      throw new Error("Failed to create todo");
    }
    return res.json();
  },
  delete: async (id: string) => {
    const res = await rpcClient.api.hono.todos[":id"].$delete({
      param: { id },
    });
    if (!res.ok) {
      throw new Error("Failed to delete todo");
    }
  },
  get: async (id: string) => {
    const res = await rpcClient.api.hono.todos[":id"].$get({
      param: { id },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch todo");
    }
    return res.json();
  },
  list: async () => {
    const res = await rpcClient.api.hono.todos.$get(
      {},
      {
        headers: {
          Authorization: `Bearer 123456789`,
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to fetch todos");
    }
    return res.json();
  },
  update: async (id: string, data: UpdateTodoDto) => {
    const res = await rpcClient.api.hono.todos[":id"].$put({
      json: data,
      param: { id },
    });
    if (!res.ok) {
      throw new Error("Failed to update todo");
    }
    return res.json();
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/hono/file-upload", {
      body: formData,
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Failed to upload file");
    }
    return res.json();
  },
};

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { useConfirm } from "@/components/confirm-dialog";
import { EditTodoDialog } from "@/components/edit-todo-dialog";
import { createTodoSchema } from "@/lib/schemas";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "@/lib/schemas";
import type { TodoApi } from "@/lib/todo-store";

export function TodoApp({ api, queryKey }: { api: TodoApi; queryKey: string }) {
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    name: string;
    type: string;
    size: number;
  } | null>(null);

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryFn: () => api.list(),
    queryKey: ["todos", queryKey],
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTodoDto) => api.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos", queryKey] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoDto }) => api.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos", queryKey] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos", queryKey] }),
  });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadFile(file),
    onSuccess: (data) => setUploadedFileInfo(data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTodoDto>({
    resolver: zodResolver(createTodoSchema),
  });

  const onSubmit = (data: CreateTodoDto) => {
    createMutation.mutate(data, { onSuccess: () => reset() });
  };

  const setEditingQuery = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("id", id);
      } else {
        params.delete("id");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const onDelete = async (todo: Todo) => {
    const ok = await confirm(`"${todo.title}"を削除しますか？`, {
      title: "削除確認",
      confirmText: "削除",
      cancelText: "閉じる",
      okVariant: "destructive",
    });

    if (!ok) {
      return;
    }

    deleteMutation.mutate(todo.id);
  };

  const onUpload = () => {
    if (!selectedFile) {
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <input
          {...register("title")}
          placeholder="Add a new todo..."
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add
        </button>
      </form>
      {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">File upload</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-300"
          />
          <button
            type="button"
            onClick={onUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </button>
        </div>
        {uploadedFileInfo && (
          <p className="mt-2 text-xs text-zinc-500">
            Uploaded: {uploadedFileInfo.name} ({uploadedFileInfo.type}, {uploadedFileInfo.size}{" "}
            bytes)
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-zinc-500">Loading...</p>
      ) : todos.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">No todos yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() =>
                  updateMutation.mutate({
                    id: todo.id,
                    data: { completed: !todo.completed },
                  })
                }
                className="h-4 w-4 rounded accent-zinc-900 dark:accent-zinc-100"
              />
              <span
                onDoubleClick={() => setEditingQuery(todo.id)}
                className={`flex-1 text-sm ${
                  todo.completed ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => setEditingQuery(todo.id)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(todo)}
                disabled={deleteMutation.isPending}
                className="text-xs text-red-400 hover:text-red-600"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <EditTodoDialog api={api} queryKey={queryKey} />
    </div>
  );
}

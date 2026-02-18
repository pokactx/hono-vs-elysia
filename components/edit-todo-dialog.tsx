"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TodoApi } from "@/lib/todo-store";

export function EditTodoDialog({ api, queryKey }: { api: TodoApi; queryKey: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editTitle, setEditTitle] = useState("");

  const editingId = searchParams.get("id");

  const closeDialog = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const todoQuery = useQuery({
    enabled: Boolean(editingId),
    queryFn: () => api.get(editingId as string),
    queryKey: ["todo", queryKey, editingId],
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => api.update(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", queryKey] });
      queryClient.invalidateQueries({
        queryKey: ["todo", queryKey, editingId],
      });
      closeDialog();
    },
  });

  useEffect(() => {
    if (todoQuery.data) {
      setEditTitle(todoQuery.data.title);
    }
  }, [todoQuery.data]);

  useEffect(() => {
    if (editingId && todoQuery.isError) {
      closeDialog();
    }
  }, [editingId, todoQuery.isError]);

  const saveEdit = () => {
    if (!editingId) {
      return;
    }
    const title = editTitle.trim();
    if (!title) {
      return;
    }
    updateMutation.mutate({ id: editingId, title });
  };

  return (
    <Dialog open={Boolean(editingId)} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit todo</DialogTitle>
          <DialogDescription>
            This dialog stays open while the URL has an `id` query parameter.
          </DialogDescription>
        </DialogHeader>
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveEdit();
            }
            if (e.key === "Escape") {
              closeDialog();
            }
          }}
          disabled={todoQuery.isLoading || updateMutation.isPending}
          autoFocus
          className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <DialogFooter>
          <button
            onClick={closeDialog}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={todoQuery.isLoading || updateMutation.isPending || !editTitle.trim()}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

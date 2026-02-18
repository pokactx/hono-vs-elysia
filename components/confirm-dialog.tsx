"use client";

import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  okVariant?: VariantProps<typeof buttonVariants>["variant"];
};

type ConfirmPayload = {
  content: React.ReactNode;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

type ConfirmContextValue = {
  confirm: (messageOrNode: string | React.ReactNode, options?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const queueRef = useRef<ConfirmPayload[]>([]);
  const [current, setCurrent] = useState<ConfirmPayload | null>(null);
  const [open, setOpen] = useState(false);

  const pump = () => {
    if (current) return;
    const next = queueRef.current.shift();
    if (!next) return;
    setCurrent(next);
    setOpen(true);
  };

  const confirm = (messageOrNode: string | React.ReactNode, options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      queueRef.current.push({
        content: messageOrNode,
        options,
        resolve,
      });
      // すぐ表示
      queueMicrotask(pump);
    });
  };

  const decide = (result: boolean) => {
    if (current) current.resolve(result);
    setOpen(false);
    setCurrent(null);
    // 次があれば続けて表示
    queueMicrotask(pump);
  };

  // Provider が消える時に未解決をキャンセル扱いで解決しておく
  useEffect(() => {
    return () => {
      if (current) current.resolve(false);
      for (const item of queueRef.current) item.resolve(false);
      queueRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  const opts = current?.options ?? {};
  const content = opts.children ?? current?.content ?? "";

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          // overlay click / ESC で閉じたらキャンセル扱い
          if (!next && open) decide(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{opts.title ?? "確認"}</DialogTitle>
            <DialogDescription>{content}</DialogDescription>
          </DialogHeader>

          <DialogFooter
            className={cn(opts.okVariant === "destructive" && "border-t border-destructive pt-2")}
          >
            <DialogClose asChild>
              <Button variant="outline"  onClick={() => decide(false)}>
                {opts.cancelText ?? "Cancel"}
              </Button>
            </DialogClose>

            <Button variant={opts.okVariant} onClick={() => decide(true)}>
              {opts.confirmText ?? "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

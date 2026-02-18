import { z } from "zod";

export const todoIdParamsSchema = z.object({
  id: z.string(),
});

export const todoSchema = z.object({
  completed: z.boolean().default(false),
  createdAt: z.string(),
  id: z.string(),
  title: z.string().min(1, "Title is required"),
});

export const createTodoSchema = todoSchema.pick({ title: true });
export const createTodoOutputSchema = z.object({ todo: z.array(todoSchema) });

export const updateTodoSchema = todoSchema.pick({ completed: true, title: true }).partial();
export const updateTodoOutputSchema = z.object({ todo: todoSchema });

export const deleteTodoOutputSchema = z.object({ deleted: z.boolean() });

export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoDto = z.infer<typeof createTodoSchema>;
export type UpdateTodoDto = z.infer<typeof updateTodoSchema>;

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "@bogeychan/elysia-logger";
import { openapi } from "@elysiajs/openapi";
import { Elysia, fileType, status } from "elysia";
import { z } from "zod";

import { S3 } from "@/lib/s3";
import { todoSchema, createTodoSchema, updateTodoSchema, todoIdParamsSchema } from "@/lib/schemas";
import { elysiaStore } from "@/lib/todo-store";

const errorResponse = z.object({ error: z.string() });
const deleteResponse = z.object({ success: z.boolean() });

const isAuthenticated = new Elysia({ name: "isAuthenticated" })
  .onBeforeHandle(async ({ headers }) => {
    const token = headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized");
    }
  })
  .resolve({ as: "scoped" }, ({ headers }) => {
    const token = headers.authorization?.split(" ")[1];
    return {
      userId: "1234567",
    };
  });

export const app = new Elysia({ prefix: "/api/elysia" })
  .use(
    logger({
      level: "info",
    }),
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: "Elysia TODO API",
          version: "1.0.0",
        },
      },
      path: "/openapi",
    }),
  )
  .post(
    "/file-upload",
    async ({ body }) => {
      const { file } = body;
      const fileId = Math.random().toString(36).slice(2, 15);
      const key = `${fileId}`;
      const imageFileDataArrayBuffer = await file.arrayBuffer();
      const imageFileDataBuffer = Buffer.from(imageFileDataArrayBuffer);
      const r2Url = `https://${process.env.CLOUDFLARE_R2_ASSETS_URL}/${key}`;

      await S3.send(
        new PutObjectCommand({
          Body: imageFileDataBuffer,
          Bucket: process.env.CLOUDFLARE_R2_BUCKET,
          ContentType: file.type,
          Key: key,
        }),
      );

      return {
        url: r2Url,
      };
    },
    {
      body: z.object({
        file: z.file().refine((file) => fileType(file, "image/*")),
      }),
      detail: { summary: "Upload a file", tags: ["Files"] },
    },
  )
  .group("/todos", (app) =>
    app
      .use(isAuthenticated)
      .get("/", async ({ userId }) => await elysiaStore.list(), {
        detail: { summary: "List all todos", tags: ["Todos"] },
        response: z.array(todoSchema),
      })
      .get(
        "/:id",
        async ({ params: { id }, userId }) => {
          const todo = await elysiaStore.get(id);
          if (!todo) {
            return status(404, { error: "Todo not found" });
          }
          return todo;
        },
        {
          detail: { summary: "Get a todo by ID", tags: ["Todos"] },
          params: todoIdParamsSchema,
          response: { 200: todoSchema, 404: errorResponse },
        },
      )
      .post("/", async ({ body }) => status(201, await elysiaStore.create(body)), {
        body: createTodoSchema,
        detail: { summary: "Create a todo", tags: ["Todos"] },
        response: { 201: todoSchema },
      })
      .put(
        "/:id",
        async ({ params: { id }, body }) => {
          const todo = await elysiaStore.update(id, body);
          if (!todo) {
            return status(404, { error: "Todo not found" });
          }
          return todo;
        },
        {
          body: updateTodoSchema,
          detail: { summary: "Update a todo", tags: ["Todos"] },
          params: todoIdParamsSchema,
          response: { 200: todoSchema, 404: errorResponse },
        },
      )
      .delete(
        "/:id",
        async ({ params: { id } }) => {
          const deleted = await elysiaStore.delete(id);
          if (!deleted) {
            return status(404, { error: "Todo not found" });
          }
          return { success: true };
        },
        {
          detail: { summary: "Delete a todo", tags: ["Todos"] },
          params: todoIdParamsSchema,
          response: { 200: deleteResponse, 404: errorResponse },
        },
      ),
  );

export type AppType = typeof app;

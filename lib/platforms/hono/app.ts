import { PutObjectCommand } from "@aws-sdk/client-s3";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { describeRoute, openAPIRouteHandler, resolver, validator } from "hono-openapi";
import { logger } from "hono/logger";
import { z } from "zod";

import { S3 } from "@/lib/s3";
import { createTodoSchema, todoIdParamsSchema, todoSchema, updateTodoSchema } from "@/lib/schemas";
import { honoStore } from "@/lib/todo-store";

import { requireAuth } from "./middleware";

const app = new Hono().basePath("/api/hono");

export const route = app
  .use(logger())
  .get(
    "/todos",
    requireAuth,
    describeRoute({
      responses: {
        200: {
          content: {
            "application/json": {
              schema: resolver(z.array(todoSchema)),
            },
          },
          description: "List all todos",
        },
      },
      summary: "List all todos",
      tags: ["Todos"],
    }),
    async (c) => {
      const userId = c.get("userId");
      console.log(userId);
      return c.json(await honoStore.list(), 200);
    },
  )
  .get(
    "/todos/:id",
    validator("param", todoIdParamsSchema),
    describeRoute({
      responses: {
        200: {
          content: {
            "application/json": {
              schema: resolver(todoSchema),
            },
          },
          description: "Todo found",
        },
        404: {
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
          description: "Todo not found",
        },
      },
      summary: "Get a todo by ID",
      tags: ["Todos"],
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const todo = await honoStore.get(id);
      if (!todo) {
        return c.json({ error: "Todo not found" }, 404);
      }
      return c.json(todo, 200);
    },
  )
  .post(
    "/todos",
    validator("json", createTodoSchema),
    describeRoute({
      responses: {
        201: {
          content: {
            "application/json": {
              schema: resolver(todoSchema),
            },
          },
          description: "Todo created",
        },
      },
      summary: "Create a todo",
      tags: ["Todos"],
    }),
    async (c) => {
      const body = c.req.valid("json");
      const todo = await honoStore.create(body);
      return c.json(todo, 201);
    },
  )
  .put(
    "/todos/:id",
    validator("param", todoIdParamsSchema),
    validator("json", updateTodoSchema),
    describeRoute({
      responses: {
        200: {
          content: {
            "application/json": {
              schema: resolver(todoSchema),
            },
          },
          description: "Todo updated",
        },
        404: {
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
          description: "Todo not found",
        },
      },
      summary: "Update a todo",
      tags: ["Todos"],
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const todo = await honoStore.update(id, body);
      if (!todo) {
        return c.json({ error: "Todo not found" }, 404);
      }
      return c.json(todo, 200);
    },
  )
  .delete(
    "/todos/:id",
    validator("param", todoIdParamsSchema),
    describeRoute({
      responses: {
        200: {
          content: {
            "application/json": {
              schema: resolver(z.object({ success: z.boolean() })),
            },
          },
          description: "Todo deleted",
        },
        404: {
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
          description: "Todo not found",
        },
      },
      summary: "Delete a todo",
      tags: ["Todos"],
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const deleted = await honoStore.delete(id);
      if (!deleted) {
        return c.json({ error: "Todo not found" }, 404);
      }
      return c.json({ success: true }, 200);
    },
  )
  .post(
    "/file-upload",
    validator(
      "form",
      z.object({
        file: z.file().refine((file) => file.type.startsWith("image/"), {
          message: "Image file only",
        }),
      }),
    ),
    describeRoute({
      responses: {
        200: {
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  name: z.string(),
                  type: z.string(),
                  size: z.number(),
                }),
              ),
            },
          },
          description: "Uploaded file metadata",
        },
        400: {
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
          description: "File is required",
        },
      },
      summary: "Upload a file",
      tags: ["Files"],
    }),
    async (c) => {
      const body = await c.req.parseBody();
      const { file } = body;
      if (!(file instanceof File)) {
        return c.json({ error: "File is required" }, 400);
      }

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

      return c.json({ url: r2Url }, 200);
    },
  )
  .get(
    "/openapi",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "Hono API",
          version: "1.0.0",
        },
        servers: [{ description: "Local Server", url: "http://localhost:3000" }],
      },
    }),
  );
app.get("/ui", swaggerUI({ url: "/api/hono/openapi", version: "2.0" }));
export type AppType = typeof route;

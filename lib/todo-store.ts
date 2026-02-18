import type { Todo, CreateTodoDto, UpdateTodoDto } from "./schemas";

export interface TodoApi {
  list: () => Promise<Todo[]>;
  get: (id: string) => Promise<Todo>;
  create: (data: CreateTodoDto) => Promise<Todo>;
  update: (id: string, data: UpdateTodoDto) => Promise<Todo>;
  delete: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<{
    name: string;
    type: string;
    size: number;
  }>;
}

const sleep = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export class TodoStore {
  private todos = new Map<string, Todo>();
  private nextId = 1;

  async list(): Promise<Todo[]> {
    await sleep();
    return [...this.todos.values()].toSorted(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async get(id: string): Promise<Todo | undefined> {
    await sleep();
    return this.todos.get(id);
  }

  async create(input: CreateTodoDto): Promise<Todo> {
    await sleep();
    const id = String(this.nextId++);
    const todo: Todo = {
      completed: false,
      createdAt: new Date().toISOString(),
      id,
      title: input.title,
    };
    this.todos.set(id, todo);
    return todo;
  }

  async update(id: string, input: UpdateTodoDto): Promise<Todo | undefined> {
    await sleep();
    const todo = this.todos.get(id);
    if (!todo) {
      return undefined;
    }
    const updated = { ...todo, ...input };
    this.todos.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await sleep();
    return this.todos.delete(id);
  }
}

export const honoStore = new TodoStore();
export const elysiaStore = new TodoStore();

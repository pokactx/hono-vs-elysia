import Elysia from "elysia";

class UnauthorizedError extends Error {
  status = 401;

  constructor() {
    super("ログインしてください");
    this.name = "UnauthorizedError";
  }
}

class UserNotFoundError extends Error {
  status = 404;

  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export const sessionMiddleware = new Elysia({ name: "session" })
  .error({
    UnauthorizedError,
    UserNotFoundError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "UnauthorizedError": {
        set.status = error.status;

        return {
          code: "UNAUTHORIZED",
          error: error.message,
        };
      }

      case "UserNotFoundError": {
        set.status = error.status;

        return {
          code: "USER_NOT_FOUND",
          error: error.message,
        };
      }

      default: {
        throw error;
      }
    }
  })
  .derive(async ({ headers }) => {
    const userId = headers.authorization;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const user = {
      email: "john.doe@example.com",
      id: "123456789",
      name: "John Doe",
    };

    if (!user) {
      throw new UserNotFoundError();
    }

    return { user };
  })
  .as("scoped");

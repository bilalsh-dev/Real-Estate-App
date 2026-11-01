import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type AppConfig, createApp } from "./app.ts";
import { HttpError } from "./lib/errors.ts";

const config: AppConfig = { NODE_ENV: "test", CORS_ORIGINS: ["http://localhost:3000"] };

function appThrowing(error: Error, { async = false } = {}) {
  return createApp(config, (app) => {
    app.get("/boom", () => {
      if (async) return Promise.reject(error);
      throw error;
    });
  });
}

describe("createApp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("answers the health route", async () => {
    const response = await request(createApp(config)).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns 404 JSON for unknown routes", async () => {
    const response = await request(createApp(config)).get("/nope");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Route GET /nope not found" });
  });

  it("sets helmet security headers and hides the framework", async () => {
    const response = await request(createApp(config)).get("/");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["content-security-policy"]).toBeDefined();
    expect(response.headers["cross-origin-resource-policy"]).toBe("cross-origin");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows only configured CORS origins", async () => {
    const app = createApp(config);
    const allowed = await request(app).get("/").set("Origin", "http://localhost:3000");
    const blocked = await request(app).get("/").set("Origin", "https://evil.example");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("maps HttpError to its status and message", async () => {
    const response = await request(appThrowing(new HttpError(409, "Conflict"))).get("/boom");
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "Conflict" });
  });

  it("hides internal errors behind a generic 500 without a stack trace", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await request(appThrowing(new Error("db password leaked"))).get("/boom");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal server error" });
    expect(response.text).not.toContain("leaked");
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("forwards rejected async handlers to the error handler", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await request(appThrowing(new Error("async"), { async: true })).get("/boom");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal server error" });
  });

  it("rejects malformed JSON bodies with 400", async () => {
    const app = createApp(config, (instance) => {
      instance.post("/echo", (req, res) => {
        res.json(req.body);
      });
    });
    const response = await request(app)
      .post("/echo")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Malformed JSON body" });
  });
});

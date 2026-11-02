import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { type AppConfig, createApp } from "../app.ts";
import { Role } from "../config/constants.ts";
import { UnauthorizedError } from "../lib/errors.ts";
import type { TokenVerifier } from "../lib/tokenVerifier.ts";
import { createAuthMiddleware } from "./auth.ts";

const config: AppConfig = { NODE_ENV: "test", CORS_ORIGINS: ["http://localhost:3000"] };

function appWith(verifyToken: TokenVerifier) {
  const authorize = createAuthMiddleware(verifyToken);
  return createApp(config, (app) => {
    app.get("/tenant-only", authorize([Role.Tenant]), (req, res) => {
      res.json({ user: req.user });
    });
  });
}

const tenantVerifier: TokenVerifier = () => Promise.resolve({ sub: "abc", role: "tenant" });

describe("createAuthMiddleware", () => {
  it("returns 401 without an Authorization header", async () => {
    const verifyToken = vi.fn(tenantVerifier);
    const response = await request(appWith(verifyToken)).get("/tenant-only");
    expect(response.status).toBe(401);
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it.each(["Basic abc", "Bearer", "Bearer a b", "token"])(
    "returns 401 for a malformed header (%s)",
    async (header) => {
      const response = await request(appWith(tenantVerifier))
        .get("/tenant-only")
        .set("Authorization", header);
      expect(response.status).toBe(401);
    },
  );

  it("returns 401 when the verifier rejects the token", async () => {
    const verifyToken: TokenVerifier = () =>
      Promise.reject(new UnauthorizedError("Invalid or expired token"));
    const response = await request(appWith(verifyToken))
      .get("/tenant-only")
      .set("Authorization", "Bearer forged");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid or expired token" });
  });

  it.each([
    ["a disallowed role", "manager"],
    ["no role", undefined],
    ["an unknown role", "admin"],
    ["a differently cased role", "Tenant"],
  ])("returns 403 for %s", async (_case, role) => {
    const verifyToken: TokenVerifier = () => Promise.resolve({ sub: "abc", role });
    const response = await request(appWith(verifyToken))
      .get("/tenant-only")
      .set("Authorization", "Bearer token");
    expect(response.status).toBe(403);
  });

  it("sets req.user and continues for an allowed role", async () => {
    const verifyToken = vi.fn(tenantVerifier);
    const response = await request(appWith(verifyToken))
      .get("/tenant-only")
      .set("Authorization", "Bearer good-token");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: { id: "abc", role: "tenant" } });
    expect(verifyToken).toHaveBeenCalledWith("good-token");
  });
});

// @vitest-environment node
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/state/api";
import { makeStore } from "@/state/store";

vi.mock("aws-amplify/auth", () => ({ fetchAuthSession: vi.fn(), getCurrentUser: vi.fn() }));

const API = "http://localhost:3002";
const tenant = {
  id: 1,
  cognitoId: "user-1",
  name: "ann",
  email: "ann@example.com",
  phoneNumber: "",
};

function session(payload: Record<string, unknown>) {
  const idToken = { payload, toString: () => "id-token" };
  return { tokens: { idToken, accessToken: idToken } } as unknown as Awaited<
    ReturnType<typeof fetchAuthSession>
  >;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Call = { method: string; url: string; auth: string | null; body: unknown };

function stubFetch(responses: Response[]) {
  const calls: Call[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request: Request) => {
      const text = await request.text();
      calls.push({
        method: request.method,
        url: request.url,
        auth: request.headers.get("Authorization"),
        body: text ? JSON.parse(text) : undefined,
      });
      const next = responses.shift();
      if (!next) throw new Error(`Unexpected request ${request.method} ${request.url}`);
      return next;
    }),
  );
  return calls;
}

async function loadAuthUser() {
  const store = makeStore();
  return store.dispatch(api.endpoints.getAuthUser.initiate());
}

describe("getAuthUser", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: "user-1", username: "ann" });
    vi.mocked(fetchAuthSession).mockResolvedValue(
      session({ "custom:role": "tenant", email: "ann@example.com" }),
    );
  });

  it("returns the existing profile with the Cognito info and role", async () => {
    const calls = stubFetch([json(200, tenant)]);
    const result = await loadAuthUser();

    expect(result.data).toEqual({
      cognitoInfo: { userId: "user-1", username: "ann" },
      userInfo: tenant,
      userRole: "tenant",
    });
    expect(calls).toEqual([
      { method: "GET", url: `${API}/tenants/user-1`, auth: "Bearer id-token", body: undefined },
    ]);
  });

  it("creates the database user when the profile does not exist yet", async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue(
      session({ "custom:role": "manager", email: "ann@example.com" }),
    );
    const manager = { ...tenant, id: 5 };
    const calls = stubFetch([json(404, { message: "Manager not found" }), json(201, manager)]);
    const result = await loadAuthUser();

    expect(calls[1]).toEqual({
      method: "POST",
      url: `${API}/managers`,
      auth: "Bearer id-token",
      body: { name: "ann", email: "ann@example.com", phoneNumber: "" },
    });
    expect(result.data).toEqual({
      cognitoInfo: { userId: "user-1", username: "ann" },
      userInfo: manager,
      userRole: "manager",
    });
  });

  it("fails without calling the API when the token has no valid role", async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue(session({ "custom:role": "admin" }));
    const calls = stubFetch([]);
    const result = await loadAuthUser();

    expect(result.error).toEqual({
      status: "CUSTOM_ERROR",
      error: "Your account has no valid role",
    });
    expect(calls).toHaveLength(0);
  });

  it("surfaces API errors other than 404", async () => {
    stubFetch([json(500, { message: "Internal server error" })]);
    const result = await loadAuthUser();
    expect(result.error).toMatchObject({ status: 500 });
  });

  it("fails when there is no signed-in user", async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("User needs to be authenticated"));
    stubFetch([]);
    const result = await loadAuthUser();
    expect(result.error).toEqual({
      status: "CUSTOM_ERROR",
      error: "User needs to be authenticated",
    });
  });
});

describe("settings mutations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fetchAuthSession).mockResolvedValue(session({ "custom:role": "tenant" }));
  });

  it("sends only the settings fields to the user's profile", async () => {
    const calls = stubFetch([json(200, tenant)]);
    const store = makeStore();
    await store.dispatch(
      api.endpoints.updateTenantSettings.initiate({
        cognitoId: "user-1",
        name: "Ann",
        email: "ann@example.com",
        phoneNumber: "+1 555 0100 22",
      }),
    );
    expect(calls).toEqual([
      {
        method: "PUT",
        url: `${API}/tenants/user-1`,
        auth: "Bearer id-token",
        body: { name: "Ann", email: "ann@example.com", phoneNumber: "+1 555 0100 22" },
      },
    ]);
  });
});

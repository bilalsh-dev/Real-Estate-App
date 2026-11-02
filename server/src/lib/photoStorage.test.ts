import { S3Client } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createS3PhotoStorage } from "./photoStorage.ts";

const { uploads, done } = vi.hoisted(() => ({
  uploads: [] as { params: Record<string, unknown> }[],
  done: vi.fn(),
}));

vi.mock("@aws-sdk/lib-storage", () => ({
  Upload: class {
    constructor(options: { params: Record<string, unknown> }) {
      uploads.push(options);
    }
    done = done;
  },
}));

describe("createS3PhotoStorage", () => {
  const storage = createS3PhotoStorage({
    client: new S3Client({ region: "eu-central-1" }),
    bucket: "rentiful-photos",
  });

  beforeEach(() => {
    uploads.length = 0;
    done.mockReset();
  });

  it("uploads under a random key with the content type and returns the object URL", async () => {
    done.mockResolvedValue({ Location: "https://rentiful-photos.s3/properties/x.png" });
    const buffer = Buffer.from("png");

    const url = await storage.upload({ buffer, mimetype: "image/png" });

    expect(url).toBe("https://rentiful-photos.s3/properties/x.png");
    expect(uploads[0]?.params).toMatchObject({
      Bucket: "rentiful-photos",
      Body: buffer,
      ContentType: "image/png",
    });
    expect(uploads[0]?.params["Key"]).toMatch(/^properties\/[0-9a-f-]{36}\.png$/);
  });

  it("rejects unsupported types before uploading", async () => {
    await expect(
      storage.upload({ buffer: Buffer.from(""), mimetype: "image/gif" }),
    ).rejects.toThrow(/Unsupported/);
    expect(uploads).toHaveLength(0);
  });

  it("fails when S3 returns no URL", async () => {
    done.mockResolvedValue({});
    await expect(
      storage.upload({ buffer: Buffer.from(""), mimetype: "image/jpeg" }),
    ).rejects.toThrow(/no object URL/);
  });
});

import { randomUUID } from "node:crypto";
import type { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PHOTO_EXTENSIONS, PROPERTY_PHOTO_KEY_PREFIX } from "../config/constants.ts";

export type PhotoFile = {
  buffer: Buffer;
  mimetype: string;
};

export type PhotoStorage = {
  upload(file: PhotoFile): Promise<string>;
};

export function createS3PhotoStorage(config: { client: S3Client; bucket: string }): PhotoStorage {
  return {
    async upload(file) {
      const extension = PHOTO_EXTENSIONS[file.mimetype];
      if (!extension) throw new Error(`Unsupported photo type ${file.mimetype}`);

      const { Location } = await new Upload({
        client: config.client,
        params: {
          Bucket: config.bucket,
          Key: `${PROPERTY_PHOTO_KEY_PREFIX}${randomUUID()}${extension}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      }).done();

      if (!Location) throw new Error("S3 upload returned no object URL");
      return Location;
    },
  };
}

import { Prisma } from "../generated/prisma/client.ts";

export const PrismaErrorCode = {
  UniqueConstraint: "P2002",
  RecordNotFound: "P2025",
} as const;

export type PrismaErrorCode = (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode];

export function hasPrismaErrorCode(error: unknown, code: PrismaErrorCode): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

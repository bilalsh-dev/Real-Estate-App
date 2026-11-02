import type { Request, RequestHandler, Response } from "express";
import type { z } from "zod";
import { ValidationError, type ValidationIssue } from "../lib/errors.ts";

type RequestPart = "params" | "query" | "body";

type RequestSchemas = Partial<Record<RequestPart, z.ZodType>>;

type ValidatedInput<S extends RequestSchemas> = {
  [K in keyof S]: S[K] extends z.ZodType ? z.output<S[K]> : never;
};

const REQUEST_PARTS: readonly RequestPart[] = ["params", "query", "body"];

export function withValidation<S extends RequestSchemas>(
  schemas: S,
  handler: (input: ValidatedInput<S>, req: Request, res: Response) => Promise<void> | void,
): RequestHandler {
  return async (req, res) => {
    const input: Partial<Record<RequestPart, unknown>> = {};
    const issues: ValidationIssue[] = [];

    for (const part of REQUEST_PARTS) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) {
        input[part] = result.data;
      } else {
        issues.push(
          ...result.error.issues.map((issue) => ({
            path: [part, ...issue.path.map(String)].join("."),
            message: issue.message,
          })),
        );
      }
    }

    if (issues.length > 0) throw new ValidationError(issues);
    await handler(input as ValidatedInput<S>, req, res);
  };
}

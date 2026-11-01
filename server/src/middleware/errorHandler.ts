import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError, NotFoundError } from "../lib/errors.ts";

const INTERNAL_ERROR_MESSAGE = "Internal server error";
const MALFORMED_JSON_MESSAGE = "Malformed JSON body";

function isMalformedJson(error: unknown): boolean {
  return error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed";
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  if (isMalformedJson(error)) {
    res.status(400).json({ message: MALFORMED_JSON_MESSAGE });
    return;
  }

  console.error(error);
  res.status(500).json({ message: INTERNAL_ERROR_MESSAGE });
};

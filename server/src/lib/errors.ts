export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export type ValidationIssue = {
  path: string;
  message: string;
};

export class ValidationError extends HttpError {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(400, "Invalid request");
    this.name = "ValidationError";
    this.issues = issues;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

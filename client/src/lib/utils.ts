import { toast } from "sonner";

export { cn } from "cn";

const THOUSAND = 1000;

export function formatEnumString(value: string): string {
  return value.replace(/([A-Z])/g, " $1").trim();
}

export function formatPriceValue(value: number | null, isMin: boolean): string {
  if (value === null || value === 0) return isMin ? "Any Min Price" : "Any Max Price";
  if (value >= THOUSAND) {
    const kValue = value / THOUSAND;
    return isMin ? `$${kValue}k+` : `<$${kValue}k`;
  }
  return isMin ? `$${value}+` : `<$${value}`;
}

function isMeaningful(value: unknown): boolean {
  if (value === undefined || value === null || value === "" || value === "any") return false;
  if (Array.isArray(value)) return value.some((item) => item !== null);
  return true;
}

export function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => isMeaningful(value)),
  ) as Partial<T>;
}

type ToastMessages = {
  success?: string;
  error?: string;
};

export async function withToast<T>(operation: Promise<T>, messages: ToastMessages): Promise<T> {
  try {
    const result = await operation;
    if (messages.success) toast.success(messages.success);
    return result;
  } catch (error) {
    if (messages.error) toast.error(messages.error);
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error) || typeof error.status !== "number" || error.status >= 500) return fallback;
  const { data } = error;
  return isRecord(data) && typeof data.message === "string" ? data.message : fallback;
}

export function safeRedirectPath(path: string | null | undefined, fallback = "/"): string {
  if (!path?.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  return path;
}

export function isWithinPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatMonth(value: string | Date): string {
  return monthFormatter.format(new Date(value));
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function parseIdParam(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

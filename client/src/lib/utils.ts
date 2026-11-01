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

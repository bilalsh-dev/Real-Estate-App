import { Loader2 } from "lucide-react";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16">
      <Loader2 className="size-6 animate-spin text-primary-700" aria-hidden />
      <span className="text-sm font-medium text-primary-700">{label}</span>
    </div>
  );
}

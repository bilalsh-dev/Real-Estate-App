"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/state/StoreProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <TooltipProvider>
        {children}
        <Toaster theme="light" closeButton />
      </TooltipProvider>
    </StoreProvider>
  );
}

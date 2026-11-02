"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { configureAmplify } from "@/lib/amplify";
import { StoreProvider } from "@/state/StoreProvider";

configureAmplify();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Authenticator.Provider>
        <TooltipProvider>
          {children}
          <Toaster theme="light" closeButton />
        </TooltipProvider>
      </Authenticator.Provider>
    </StoreProvider>
  );
}

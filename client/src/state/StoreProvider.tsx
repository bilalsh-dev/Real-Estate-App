"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore } from "@/state/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => {
    const created = makeStore();
    setupListeners(created.dispatch);
    return created;
  });

  return <Provider store={store}>{children}</Provider>;
}

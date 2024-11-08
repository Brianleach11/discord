"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

export default ConvexClientProvider;

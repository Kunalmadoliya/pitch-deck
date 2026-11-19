import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Get the signed-in user's session for server components.
 * Wrapped in React `cache`, so the dashboard layout and page share ONE lookup per request
 * instead of each asking for the session again.
 */
export const getServerSession = cache(async () => auth.api.getSession({ headers: await headers() }));

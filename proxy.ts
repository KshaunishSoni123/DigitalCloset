import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";
import { logger } from "@/utils/logger";

export async function proxy(request: NextRequest) {
  const start = Date.now();
  const response = await updateSession(request);

  logger.info("HTTP request", {
    action: "proxy",
    metadata: {
      method: request.method,
      path: request.nextUrl.pathname,
      status: response.status,
      latencyMs: Date.now() - start,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

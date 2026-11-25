import { NextRequest, NextResponse } from "next/server";

const railwayBackendDomain = "vistor-production.up.railway.app";
const railwayFlutterOrigin = "https://vistor-production-3aae0f81.up.railway.app";

function allowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  const configuredOrigins = (process.env.FLUTTER_WEB_ORIGIN ?? "")
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  if (configuredOrigins.includes(origin)) return true;
  if (configuredOrigins.length === 0 &&
      process.env.RAILWAY_PUBLIC_DOMAIN === railwayBackendDomain &&
      origin === railwayFlutterOrigin) return true;

  // Flutter's local Chrome debug port changes unless --web-port is specified.
  return process.env.NODE_ENV === "development" &&
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function addCorsHeaders(response: NextResponse, origin: string) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization",
  );
  response.headers.set("Access-Control-Max-Age", "600");
  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigin(origin);
  const preflight = request.method === "OPTIONS" &&
    request.headers.has("access-control-request-method");
  const response = preflight
    ? new NextResponse(null, { status: allowed ? 204 : 403 })
    : NextResponse.next();
  response.headers.append("Vary", "Origin");
  return allowed ? addCorsHeaders(response, origin) : response;
}

export const config = {
  matcher: "/qr-code/api/:path*",
  runtime: "nodejs",
};

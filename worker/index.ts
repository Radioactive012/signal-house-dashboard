import handler from "vinext/server/app-router-entry";

interface Env { ASSETS: Fetcher; }
interface ExecutionContext { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void; }

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return Response.redirect(url.origin + "/field-manual/index.html", 302);
    }
    return handler.fetch(request, env, ctx);
  },
};

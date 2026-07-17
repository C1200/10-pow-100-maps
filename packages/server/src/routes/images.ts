import { Hono } from "hono";
import { cache } from "hono/cache";
import { error } from "../util/error";

const app = new Hono<CtxConfig>();

app.get(
  "*",
  cache({
    cacheName: "10-pow-100-maps-serve",
    cacheControl: "public, max-age=14400",
  }),
);

app.get("/tiles/:lod/:x{-?\\d+}/:z{-?\\d+}", async (c) => {
  const timeout = new AbortController();
  const t = setTimeout(() => {
    timeout.abort();
  }, 2000);

  let res: Response;
  try {
    res = await fetch(
      `${c.env.BLUEMAP_URL}/maps/${c.env.BLUEMAP_WORLD}/tiles/${c.req.param("lod")}/x${c.req.param("x")}/z${c.req.param("z")}.png`,
      { signal: timeout.signal },
    );
    clearTimeout(t);
  } catch {
    return error(c, "Gateway timeout", 504);
  }

  if (!res.ok) {
    return error(c, `Bad gateway (target returned status ${res.status})`, 502);
  }

  if (res.status === 204) {
    return c.newResponse(null, { status: 204 });
  }

  c.res.headers.append("content-type", "image/png");
  return c.newResponse(res.body);
});

//app.get("/poi-screenshot/:poi/:image", async (c) => {
//  const res = await c.env.FILES.get(c.req.path.substring(1));
//
//  if (!res) {
//    return error(c, "Image not found", 404);
//  }
//});

export default app;

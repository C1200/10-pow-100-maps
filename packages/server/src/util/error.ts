import { ContentfulStatusCode } from "hono/utils/http-status";

export function error(c: Context, error: string, code: ContentfulStatusCode) {
  return c.json({ error, code }, { status: code });
}

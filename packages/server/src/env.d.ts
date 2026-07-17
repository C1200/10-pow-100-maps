import { Context as HonoContext } from "hono";

declare global {
  export type CtxConfig = { Bindings: CloudflareBindings };
  export type Context = HonoContext<CtxConfig>;
}

import { Hono } from "hono";
import { discordAuth } from "@hono/oauth-providers/discord";
import { putDiscordUser } from "../util/user";

const app = new Hono<CtxConfig>();

app.get(
  "/discord",
  discordAuth({
    scope: ["identify"],
  }),
  (c) => {
    putDiscordUser(c);
    return c.redirect(c.env.APP_URL);
  },
);

export default app;

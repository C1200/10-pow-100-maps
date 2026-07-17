import { Hono } from "hono";
import { getDiscordUser } from "../../util/user";
import { error } from "../../util/error";

const app = new Hono<CtxConfig>();

app.get("/", async (c) => {
  const user = await getDiscordUser(c);
  if (user) {
    return c.json(user);
  }
  return error(c, "Unauthorized", 401);
});

export default app;

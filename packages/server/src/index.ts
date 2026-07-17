import { Hono } from "hono";
import { error } from "./util/error";

import auth from "./routes/auth";
import images from "./routes/images";

import userv1 from "./routes/v1/user";

const app = new Hono<CtxConfig>();

app.use(async (c, next) => {
  c.res.headers.append("access-control-allow-origin", c.env.APP_URL);
  c.res.headers.append("access-control-allow-credentials", "true");
  await next();
});

app.route("/auth", auth);
app.route("/images", images);

app.route("/api/v1/user", userv1);

app.all("*", (c) => {
  return error(c, "Not found", 404);
});

export default app;

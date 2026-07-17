import { getCookie, setCookie } from "hono/cookie";
import {
  DiscordMeResponse,
  DiscordTokenResponse,
  refreshToken,
} from "@hono/oauth-providers/discord";

const userCookie = "GoogolUserToken";
const refreshCookie = "GoogolRefreshToken";

export async function getDiscordUser(c: Context) {
  const user = getCookie(c, userCookie);
  const refresh = getCookie(c, refreshCookie);
  if (!refresh) return null;

  setCookie(c, refreshCookie, refresh, {
    maxAge: 14 * 24 * 60 * 60,
    httpOnly: true,
    path: "/",
  });

  if (!user) {
    try {
      putDiscordUser(
        c,
        await refreshToken(c.env.DISCORD_ID, c.env.DISCORD_SECRET, refresh),
      );
    } catch {
      return null;
    }
  }

  const res = await fetch("https://discord.com/api/oauth2/@me", {
    headers: { authorization: `Bearer ${user}` },
  });
  if (!res.ok) return null;

  return (await res.json<DiscordMeResponse>()).user;
}

export function putDiscordUser(c: Context, r?: DiscordTokenResponse) {
  const user = r ? r.access_token : c.get("token")?.token;
  const expires = r ? r.expires_in : c.get("token")?.expires_in;
  const refresh = r ? r.refresh_token : c.get("refresh-token")?.token;

  if (user && expires) {
    setCookie(c, userCookie, user, {
      maxAge: expires,
      httpOnly: true,
      path: "/",
    });
  }

  if (refresh) {
    setCookie(c, refreshCookie, refresh, {
      maxAge: 14 * 24 * 60 * 60,
      httpOnly: true,
      path: "/",
    });
  }
}

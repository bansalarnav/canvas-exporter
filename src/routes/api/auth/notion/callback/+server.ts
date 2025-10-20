import { json, type RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import jwt from "jsonwebtoken";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { code } = await request.json();
  if (!code) {
    return json(
      { success: false, message: "Code is required" },
      {
        status: 400,
      },
    );
  }

  const clientId = env.NOTION_CLIENT_ID;
  const clientSecret = env.NOTION_CLIENT_SECRET;
  const redirectUri = env.NOTION_REDIRECT_URL;

  const encoded = btoa(`${clientId}:${clientSecret}`);

  const res = await (
    await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })
  ).json();

  const payload = {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    botId: res.bot_id,
  };

  const cookie = jwt.sign(payload, env.JWT_KEY);

  cookies.set("notion_auth", cookie, {
    path: "/",
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 * 6), // 6 months
  });

  return json({ success: true });
};

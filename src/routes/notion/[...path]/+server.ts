import { env } from "$env/dynamic/private";
import { error, type RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { json } from "@sveltejs/kit";

const NOTION_API_BASE = "https://api.notion.com";

export const fallback: RequestHandler = async ({
  request,
  cookies,
  params,
}) => {
  const cookie = cookies.get("notion_auth");
  if (!cookie) {
    throw error(401, "Unauthorized");
  }

  const { accessToken } = jwt.verify(cookie, env.JWT_KEY) as {
    accessToken: string;
  };

  const url = `${NOTION_API_BASE}/${params.path}`;

  const notionRequest = new Request(url, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": request.headers.get("notion-version") as string,
    },
    body: request.body,
    // @ts-ignore
    duplex: "half",
  });


  try {
    const response = await fetch(notionRequest);
    const data = await response.json();
    return json(data);
  } catch (e) {
    console.log("Error proxying to Notion:", e);
    throw error(500, "Proxy Error");
  }
};

export const GET = fallback;
export const POST = fallback;
export const PUT = fallback;
export const PATCH = fallback;
export const DELETE = fallback;

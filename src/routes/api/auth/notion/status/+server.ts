import { json, type RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import jwt from "jsonwebtoken";

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const cookie = cookies.get("notion_auth");

    if (!cookie) {
      throw new Error("No cookie found");
    }

    const payload = jwt.verify(cookie || "", env.JWT_KEY);

    return json({
      success: true,
      workspaceId: (payload as any).workspaceId,
    });
  } catch (e) {
    return json({
      success: false,
    });
  }
};

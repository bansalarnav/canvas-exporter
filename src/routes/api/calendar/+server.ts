import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith("http") || !url.endsWith(".ics")) {
      return json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return json(
        { error: "Failed to fetch calendar" },
        { status: response.status },
      );
    }

    const icsData = await response.text();
    return json({ data: icsData });
  } catch (error) {
    return json({ error: "Server error" }, { status: 500 });
  }
};

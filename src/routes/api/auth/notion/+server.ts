import { env } from "$env/dynamic/private";

export const GET = async () => {
  const clientId = env.NOTION_CLIENT_ID;
  const redirectUri = env.NOTION_REDIRECT_URL;

  let notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}`;

  return Response.redirect(notionAuthUrl);
};

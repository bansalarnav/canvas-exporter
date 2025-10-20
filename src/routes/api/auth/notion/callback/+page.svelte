<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";

  async function handleCallback() {
    if (window.opener) {
      const code = page.url.searchParams.get("code");
      const res = await fetch("/api/auth/notion/callback", {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      let returnMessage = "NOTION_AUTH_COMPLETE";
      if (!res.ok) {
        returnMessage = "NOTION_AUTH_ERROR";
      }

      window.opener.postMessage(
        { type: returnMessage },
        window.location.origin,
      );
      window.close();
    }
  }

  onMount(() => {
    handleCallback();
  });
</script>

<div>Authenticating...</div>

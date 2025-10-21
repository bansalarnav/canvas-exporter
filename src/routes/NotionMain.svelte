<script lang="ts" module>
  import NotionSelectDB from "./NotionSelectDB.svelte";
  import Button from "$lib/components/Button.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import type { Event as CalendarEvent } from "./Assignments.svelte";

  export type Props = {
    selectedAssignments: Record<string, CalendarEvent[]>;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  let { selectedAssignments }: Props = $props();

  let authorising = $state(false);
  let loading = $state(true);
  let error = $state("");
  let authorised = $state(false);
  let workspaceId = $state<string | null>(null);

  function openNotionAuthWindow() {
    authorising = true;
    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : screen.width;
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - 600) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 700) / 2 / systemZoom + dualScreenTop;

    const popupWindow = window.open(
      "/api/auth/notion",
      "Authorize Notion",
      `
      scrollbars=yes,
      width=${600 / systemZoom}, 
      height=${700 / systemZoom}, 
      top=${top}, 
      left=${left}
      `,
    );

    if (!popupWindow) {
      alert("Popup window blocked. Please enable popups for this site.");
    }
  }

  async function handleAuthMessage(event: Event) {
    // @ts-ignore
    if (event.data.type == "NOTION_AUTH_COMPLETE") {
      await fetchNotionTokens();
    } else {
      error = "Failed to authorise with Notion.";
    }
    authorising = false;
  }

  async function fetchNotionTokens() {
    loading = true;
    const res = await fetch("/api/auth/notion/status", {
      credentials: "include",
    });
    const data = await res.json();

    authorised = data.success;
    if (data.success) {
      workspaceId = data.workspaceId;
    }

    loading = false;
  }

  onMount(() => {
    window.addEventListener("message", handleAuthMessage);
    fetchNotionTokens();
  });

  onDestroy(() => {
    window.removeEventListener("message", handleAuthMessage);
  });
</script>

<div>
  <p class="text-balance tracking-light font-semibold text-xl">
    Exporting {Object.keys(selectedAssignments).reduce(
      (acc, key) => acc + selectedAssignments[key].length,
      0,
    )}{" "} assignments
  </p>
  {#if loading}
    <div class="flex items-center justify-center h-full mt-[16px]">
      <Loader color="#000000" size={40} />
    </div>
  {:else if authorised}
    <NotionSelectDB {workspaceId} />
  {:else}
    <Button
      onclick={openNotionAuthWindow}
      loading={authorising}
      class="w-full mt-[24px]">Authorise with Notion</Button
    >
  {/if}
  {error}
</div>

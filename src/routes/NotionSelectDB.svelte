<script lang="ts" module>
  export type Props = {};
</script>

<script lang="ts">
  import { Client } from "@notionhq/client";
  import { page } from "$app/state";
  import { onMount } from "svelte";

  let {}: Props = $props();

  let loading = $state(false);

  onMount(() => {
    async function fetchData() {
      loading = true;
      const notion = new Client({
        baseUrl: `${page.url.origin}/notion`,
      });

      try {
        const response = await notion.search({
          filter: {
            value: "data_source",
            property: "object",
          },
        });

        console.log("Notion Databases:", response);
      } catch (error) {
        console.error("Error fetching Notion databases:", error);
      } finally {
        loading = false;
      }
    }

    fetchData();
  });
</script>

<div>Hello world!</div>

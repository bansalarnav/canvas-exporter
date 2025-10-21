<script lang="ts" module>
  export type Props = {
    next: (dataSourceId: string) => void;
  };
</script>

<script lang="ts">
  import Loader from "$lib/components/Loader.svelte";
  import { Client } from "@notionhq/client";
  import { Label, RadioGroup } from "bits-ui";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import Button from "$lib/components/Button.svelte";

  const { next }: Props = $props();

  let loading = $state(false);
  let error = $state<string | null>(null);

  let databases = $state<any[]>([]);
  let selected = $state<string | undefined>("");
  let submitting = $state(false);

  const notion = new Client({
    baseUrl: `${page.url.origin}/notion`,
  });

  onMount(() => {
    async function fetchData() {
      loading = true;
      try {
        const { results } = await notion.search({
          filter: {
            value: "data_source",
            property: "object",
          },
        });

        const dbs = [];
        for (const result of results) {
          if (result.object === "data_source") {
            // @ts-ignore
            const title = result.title[0]?.plain_text || "Untitled";
            dbs.push({ id: result.id, title, properties: result.properties });
          }
        }

        databases = dbs;
      } catch (error) {
        error = "An error occured while fetching data from Notion.";
      } finally {
        loading = false;
      }
    }

    fetchData();
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    submitting = true;
    if (!selected) {
      submitting = false;
      return;
    }

    const cols = [
      { name: ["name", "homework"], type: "title" },
      { name: ["description", "details"], type: "rich_text" },
      { name: ["due", "due date"], type: "date" },
      { name: ["course", "class"], type: "rich_text" },
      { name: ["url", "link"], type: "url" },
      { name: ["uid"], type: "rich_text" },
    ];

    if (selected == "new") {
      const result = await notion.databases.create({
        parent: {
          type: "workspace",
          workspace: true,
        },
        initial_data_source: {
          properties: cols.reduce((acc, col) => {
            acc[col.name[0]] = {
              [col.type]: {},
            };
            return acc;
          }, {} as any),
        },
        title: [
          {
            type: "text",
            text: {
              content: "Canvas Assignment Export",
            },
          },
        ],
      });

      next(result.id);
    } else {
      const db = databases.find((db) => db.id === selected);
      const properties = $state.snapshot(db.properties);

      const missing = [];

      for (const col of cols) {
        let found = false;

        for (const name of col.name) {
          for (const prop in properties) {
            if (
              properties[prop].name
                .toLowerCase()
                .includes(name.toLowerCase()) &&
              properties[prop].type === col.type
            ) {
              found = true;
              break;
            }
          }
          if (found) break;
        }

        if (!found) {
          missing.push(col);
        }
      }

      const needsConfirmation = missing.length > 0;
      const res = needsConfirmation
        ? window.confirm(
            "This will add the following properties to the selected database:\n" +
              missing
                .map((col) => `- ${col.name[0]} (${col.type})`)
                .join("\n") +
              "\n\nDo you want to continue?",
          )
        : true;

      if (res && needsConfirmation) {
        await notion.dataSources.update({
          data_source_id: selected,
          properties: missing.reduce((acc, col) => {
            acc[col.name[0]] = {
              [col.type]: {},
            };
            return acc;
          }, {} as any),
        });
      }

      if (needsConfirmation && !res) {
        submitting = false;
        return;
      }

      next(selected);
    }

    submitting = false;
  }
</script>

<div>
  <div class="mt-[12px]">
    {#if loading}
      <div class="flex items-center justify-center h-full mt-[16px]">
        <Loader color="#000000" size={40} />
      </div>
    {:else}
      <p class="text-[#767676]">Select a database to export to</p>
      <form onsubmit={handleSubmit}>
        <RadioGroup.Root
          class="flex flex-col text-sm font-medium mt-[8px]"
          bind:value={selected}
        >
          {#each databases as db}
            <Label.Root
              for={db.id}
              class="text-foreground group my-[5px] flex select-none items-center transition-all  py-2 px-3 rounded-md cursor-pointer hover:bg-[#00000007]"
            >
              <RadioGroup.Item
                id={db.id}
                value={db.id}
                class="border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-4 size-4 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out"
              />
              <p class="ml-[12px] font-[400] text-[16px]">{db.title}</p>
            </Label.Root>
          {/each}
          <div class="flex items-center">
            <div class="h-[2px] w-full bg-[#00000008]"></div>
            <p class="px-4 text-[#00000030]">or</p>
            <div class="h-[2px] w-full bg-[#00000008]"></div>
          </div>
          <Label.Root
            for="new"
            class="text-foreground group my-[5px] flex select-none items-center transition-all  py-2 px-3 rounded-md cursor-pointer hover:bg-[#00000005] data-[state=checked]:bg-[#00000008]"
          >
            <RadioGroup.Item
              id="new"
              value="new"
              class="border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-4 size-4 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out"
            />
            <p class="ml-[12px] font-[400] text-[16px]">Create new database</p>
          </Label.Root>
        </RadioGroup.Root>
        <p>{error}</p>
        <div class="flex justify-end">
          <Button type="submit" loading={submitting} class="text-[15px] mt-4"
            >Continue --></Button
          >
        </div>
      </form>
    {/if}
  </div>
</div>

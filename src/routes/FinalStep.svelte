<script lang="ts" module>
  import { type Event } from "./Assignments.svelte";

  export type Props = {
    selectedAssignments: Record<string, Event[]>;
    selectedDatasourceId: string;
  };
</script>

<script lang="ts">
  import { Progress } from "bits-ui";
  import { onMount } from "svelte";
  import { Client } from "@notionhq/client";
  import { page } from "$app/state";
  const { selectedAssignments, selectedDatasourceId }: Props = $props();

  let exported = $state(0);
  let total = $derived(
    Object.keys(selectedAssignments).reduce(
      (acc, key) => acc + selectedAssignments[key].length,
      0,
    ),
  );

  const notion = new Client({
    baseUrl: `${page.url.origin}/notion`,
  });

  async function exportAssignments() {
    const existingAssignments = [];
    let hasMore = true;
    let nextCursor = null;

    while (hasMore) {
      const res = await notion.dataSources.query({
        data_source_id: selectedDatasourceId,
        filter: {
          property: "uid",
          rich_text: {
            is_not_empty: true,
          },
        },
        ...(nextCursor ? { start_cursor: nextCursor } : {}),
      });

      if (res.has_more) {
        nextCursor = res.next_cursor;
      } else {
        hasMore = false;
      }

      existingAssignments.push(...res.results);
    }

    for (const course of Object.keys(selectedAssignments)) {
      for (const asmt of selectedAssignments[course]) {
        const duplicate = existingAssignments.find(
          (ea) =>
            // @ts-ignore
            ea.properties.uid.rich_text[0]?.plain_text === asmt.uid,
        );

        if (duplicate) {
          exported += 1;
          continue;
        }

        await notion.pages.create({
          parent: {
            data_source_id: selectedDatasourceId,
          },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: asmt.title,
                  },
                },
              ],
            },
            uid: {
              rich_text: [
                {
                  text: {
                    content: asmt.uid,
                  },
                },
              ],
            },
            due: {
              date: {
                start: asmt.dtstart,
              },
            },
            course: {
              rich_text: [
                {
                  text: {
                    content: course,
                  },
                },
              ],
            },
            description: {
              rich_text: [
                {
                  text: {
                    content: asmt.description
                      ? asmt.description.substring(0, 2000)
                      : "",
                  },
                },
              ],
            },
          },
        });

        exported += 1;
      }
    }
  }

  onMount(() => {
    exportAssignments();
  });
</script>

<div>
  <p class="text-balance tracking-light font-semibold text-xl">
    Exporting {total}
    {" "} assignments
  </p>
  <div class="flex justify-between mt-[12px] mb-[4px]">
    <span>Exporting...</span>
    <span>{(exported / total) * 100}%</span>
  </div>
  <Progress.Root
    value={exported}
    max={total}
    class="bg-dark-10 shadow-mini-inset relative h-[15px] w-full overflow-hidden rounded-full"
  >
    <div
      class="bg-foreground shadow-mini-inset h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out"
      style={`transform: translateX(-${100 - (100 * (exported ?? 0)) / total}%)`}
    ></div>
  </Progress.Root>
  <p class="mt-[12px]">
    {exported == total
      ? "Finished!"
      : "This may take a while. Please do not close the tab"}
  </p>
</div>

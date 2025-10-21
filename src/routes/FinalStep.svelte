<script lang="ts" module>
  import { type Event } from "./Assignments.svelte";

  export type Props = {
    selectedAssignments: Record<string, Event[]>;
    selectedDatasourceId: string;
  };
</script>

<script lang="ts">
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

        const result = await notion.pages.create({
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
  <p class="mt-[12px]">
    Processing... This may take a while. Please do not close the tab
    <span>{exported} / {total}</span>
  </p>
</div>

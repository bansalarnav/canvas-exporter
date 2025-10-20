<script lang="ts" module>
  export type Props = {
    icsText: string;
    back: () => void;
    next: (inp: Record<string, Event[]>) => void;
  };

  export type Event = {
    title: string;
    course: string;
    summary: string;
    uid: string;
    dtstart: string;
    dtend?: string;
    description?: string;
    url?: string;
  };
</script>

<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import ICAL from "ical.js";

  const { icsText, back, next }: Props = $props();
  let error = $state();

  function convertCanvasUrl(inputUrl: string) {
    try {
      const url = new URL(inputUrl);

      const contextParam = url.searchParams.get("include_contexts");
      const courseId = contextParam!.split("_")[1];

      const hashValue = url.hash.substring(1);
      const assignmentId = hashValue.split("_")[1];

      const outputUrl = `https://canvas.illinois.edu/courses/${courseId}/assignments/${assignmentId}`;

      return outputUrl;
    } catch (error) {
      return null;
    }
  }

  function processIcsText(text: string) {
    try {
      const jcal = ICAL.parse(text);
      const events = jcal[2];

      const processedEvents: Record<string, Event[]> = {};
      for (const e of events) {
        if (e[0] != "vevent") {
          error = "Invalid .ics file";
          break;
        }

        const mandatoryProperties = ["summary", "uid", "dtstart"];
        const otherProperties = ["dtend", "description", "url"];

        const p = e[1];

        const event: Record<string, any> = {};
        for (const prop of p) {
          const propName = prop[0];
          const propValue = prop[3];

          if (
            mandatoryProperties.includes(propName) ||
            otherProperties.includes(propName)
          ) {
            if (propName === "summary") {
              const regex = /^(.*)\[([^\]]+)\]$/;

              const match = propValue.match(regex);

              let title = "";
              let course = "";

              if (match && match.length === 3) {
                title = match[1].trim();
                course = match[2];
              }
              event["title"] = title;
              const courseParts = course.split("_");
              event["course"] = courseParts[0].toUpperCase() + courseParts[1];
              event[propName] = propValue;
            } else if (propName === "url") {
              const convertedUrl = convertCanvasUrl(propValue);
              if (convertedUrl) {
                event["url"] = convertedUrl;
              }
            } else {
              event[propName] = propValue;
            }
          }
        }
        if (!processedEvents[event.course]) {
          processedEvents[event.course] = [];
        }

        processedEvents[event.course].push(event as Event);
      }

      return processedEvents;
    } catch (e) {
      return {};
    }
  }

  const asmts: Record<string, Event[]> = $derived.by(() =>
    processIcsText(icsText),
  );

  $effect(() => {
    if (Object.keys(asmts).length === 0) {
      error = "No assignments found in the .ics file.";
    }
  });

  const initialSelectedCourses: Record<string, boolean> = {};
  for (const course of Object.keys(asmts)) {
    initialSelectedCourses[course] = true;
  }
  const selectedCourses = $state(initialSelectedCourses);
</script>

<div class="overflow-scroll">
  <button
    onclick={back}
    class="outline-none border-none cursor-pointer text-muted-foreground hover:text-foreground transition-all"
    >{"<-"} Back</button
  >
  {#if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <p class="text-balance tracking-light font-semibold text-xl mt-[8px]">
      Select courses to export
    </p>
    <div>
      {#each Object.keys(asmts) as course (course)}
        <label for={course} class="cursor-pointer">
          <div
            class="flex items-start gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors my-3"
          >
            <Checkbox
              id={course}
              bind:checked={selectedCourses[course]}
              class="mt-0.5"
            />
            <div class="flex-1 space-y-1">
              <label
                for={course}
                class="text-base font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {course}
              </label>
              <p class="text-sm text-muted-foreground">
                {asmts[course].length} assignment{asmts[course].length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>
        </label>
      {/each}

      <div class="flex justify-end">
        <Button
          onclick={() => {
            const filteredAsmts: Record<string, Event[]> = {};
            for (const [course, events] of Object.entries(asmts)) {
              if (selectedCourses[course]) {
                filteredAsmts[course] = events;
              }
            }
            next(filteredAsmts);
          }}
          class="text-[15px]  mt-4">Continue --></Button
        >
      </div>
    </div>
  {/if}
</div>

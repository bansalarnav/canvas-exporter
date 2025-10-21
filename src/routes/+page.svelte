<script lang="ts">
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import InputForm from "./InputForm.svelte";
  import Assignments, { type Event } from "./Assignments.svelte";
  import NotionMain from "./NotionMain.svelte";

  let currentStep: number = $state(1);
  let previousStep: number = $state(1);
  let icsText: string = $state("");
  let containerHeight: number = $state(422);
  let selectedAssignments: Record<string, Event[]> = $state({});

  function finishIcsImport(inp: string) {
    icsText = inp;
    previousStep = currentStep;
    currentStep = 2;
  }

  function finishAssignmentSelect(inp: Record<string, Event[]>) {
    selectedAssignments = inp;
    previousStep = currentStep;
    currentStep = 3;
  }

  function back() {
    previousStep = currentStep;
    currentStep = 1;
  }

  function updateHeight(node: HTMLElement) {
    containerHeight = node.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
      containerHeight = node.offsetHeight;
    });

    resizeObserver.observe(node);

    return {
      destroy() {
        resizeObserver.disconnect();
      },
    };
  }
</script>

<Header />
<main
  class="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
>
  <div class="w-full max-w-md space-y-8">
    <div class="text-center">
      <h1
        class="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        Canvas to Notion
      </h1>
      <p class="mt-4 text-pretty text-muted-foreground leading-relaxed">
        Export all your Canvas assignments directly to your Notion database.
        Keep track of deadlines and coursework in one place.
      </p>
    </div>

    <div
      class="rounded-lg border border-border bg-card p-6 sm:p-8 overflow-hidden relative transition-all duration-300"
      style="min-height: {containerHeight}px"
    >
      {#key currentStep}
        <div
          class="w-full absolute top-0 left-0 p-6 sm:p-8"
          use:updateHeight
          in:fly={{
            x: currentStep > previousStep ? "100%" : "-100%",
            duration: 300,
            easing: quintOut,
          }}
          out:fly={{
            x: currentStep > previousStep ? "-100%" : "100%",
            duration: 300,
            easing: quintOut,
          }}
        >
          {#if currentStep === 1}
            <InputForm next={finishIcsImport} />
          {:else if currentStep === 2}
            <Assignments {icsText} {back} next={finishAssignmentSelect} />
          {:else if currentStep === 3}
            <NotionMain {selectedAssignments} />
          {/if}
        </div>
      {/key}
    </div>

    <p class="text-center text-xs text-muted-foreground mt-[-10px]">
      All data is processed directly in your browser and is never stored in any
      server.
    </p>
  </div>
</main>
<Footer />

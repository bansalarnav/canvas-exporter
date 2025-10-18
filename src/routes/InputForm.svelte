<script lang="ts" module>
  export type Props = {
    next: (icsText: string) => void;
  };
</script>

<script lang="ts">
  import Input from "$lib/components/Input.svelte";
  import Button from "$lib/components/Button.svelte";
  import { Upload } from "@lucide/svelte";

  const { next }: Props = $props();

  let link = $state("");
  let loading = $state(false);
  let error = $state("");
  let files: FileList | undefined = $state();

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = "";

    if (link.length == 0 && (!files || files.length === 0)) {
      error = "Please provide a link or upload a file.";
      loading = false;
      return;
    }

    try {
      let icsText = "";

      if (files && files.length > 0) {
        const file = files[0];
        icsText = await file.text();
      } else {
        const res = await fetch("/api/calendar", {
          method: "POST",
          body: JSON.stringify({
            url: link,
          }),
        });
        if (!res.ok) {
          error = "Failed to fetch the .ics file from the provided link.";
          loading = false;
          return;
        }
        icsText = await res.text();
      }

      next(icsText);
    } catch (e) {
      error = "An error occurred while processing the .ics file.";
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <div>
    <label>
      <p class="pb-2 text-muted-foreground">Canvas Calendar Link</p>
      <Input
        type="text"
        bind:value={link}
        disabled={loading}
        placeholder="https://canvas...."
        autofocus
      />
    </label>
  </div>

  <div class="flex items-center">
    <div class="h-[2px] w-full bg-[#00000008]"></div>
    <p class="p-4 text-[#00000030]">or</p>
    <div class="h-[2px] w-full bg-[#00000008]"></div>
  </div>
  <div class="mt-0">
    <label for="file-upload">
      <p class="pb-2 text-muted-foreground">Upload a .ics file</p>
      <div class="relative">
        <Input
          id="file-upload"
          type="file"
          accept=".ics"
          bind:value={files}
          class="hidden"
        />
        <label
          class="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50"
          for="file-upload"
        >
          <div class="flex flex-col items-center gap-2 text-center">
            <Upload class="h-8 w-8 text-muted-foreground" />
            <div class="text-sm">
              {#if files && files[0]}
                <span class="font-medium text-foreground">{files[0].name}</span>
              {:else}
                <span class="font-medium text-foreground">Click to upload</span>
                <span class="text-muted-foreground"> or drag and drop</span>
              {/if}
            </div>
            <p class="text-xs text-muted-foreground">.ics files only</p>
          </div>
        </label>
      </div>
    </label>
  </div>
  {#if error && !loading}
    <p class="text-red-500 mt-2">{error}</p>
  {/if}
  <div class="flex justify-end">
    <Button type="submit" disabled={loading} {loading} class="text-[15px]  mt-4"
      >Continue --></Button
    >
  </div>
</form>

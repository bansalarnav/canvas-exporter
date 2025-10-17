<script lang="ts" module>
  export type Props = {
    next: (icsText: string) => void;
  };
</script>

<script lang="ts">
  import Input from "$lib/components/Input.svelte";
  import Button from "$lib/components/Button.svelte";

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
  }
</script>

<form onsubmit={handleSubmit}>
  <div>
    <label>
      <Input
        type="text"
        bind:value={link}
        disabled={loading}
        placeholder="Enter Canvas Calendar link"
      />
    </label>
  </div>

  <div class="mt-4">
    <p class="text-gray-600 mb-2">Or upload an .ics file:</p>
    <input
      type="file"
      accept=".ics"
      bind:files
      disabled={loading}
      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />
  </div>
  <Button type="submit" disabled={loading}>Continue -></Button>
</form>

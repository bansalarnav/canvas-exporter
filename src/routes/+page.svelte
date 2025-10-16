<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Input from "$lib/components/Input.svelte";
  import ICAL from "ical.js";
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";

  let link = $state("");
  let loading = $state(false);
  let errorMsg = $state("");
  let files: FileList | undefined = $state();

  // my link: https://canvas.illinois.edu/feeds/calendars/user_RB0ENimJA7zwpPennAAWaa4B7IFkYNcUB11SeLT6.ics

  async function processICalData(icsText: string) {
    try {
      const jcalData = ICAL.parse(icsText);
      const comp = new ICAL.Component(jcalData);
      // TODO: Process the calendar data
      console.log("Parsed calendar data:", comp);
    } catch (err) {
      throw new Error("Failed to parse calendar data");
    }
  }

  async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.name.endsWith(".ics")) {
      errorMsg = "Please select a valid .ics file";
      return;
    }

    loading = true;
    errorMsg = "";

    try {
      const text = await file.text();
      await processICalData(text);
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : "Failed to process file";
      console.error(err);
    }

    loading = false;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    errorMsg = "";

    if (!link.startsWith("http") || !link.endsWith(".ics")) {
      errorMsg = "Please enter a valid Canvas Calendar link (ends with .ics)";
      loading = false;
      return;
    }

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      });

      const result = await res.json();

      if (!res.ok) {
        errorMsg = result.error || "Failed to fetch calendar";
        loading = false;
        return;
      }

      const icsData = result.data;
      await processICalData(icsData);
    } catch (err) {
      errorMsg =
        err instanceof Error ? err.message : "Failed to fetch calendar data";
      console.error(err);
    }

    loading = false;
  }
</script>

<Header />
<h1>Canvas Exporter</h1>
<p>Export your assignments from Canvas to a Notion Database</p>
<form onsubmit={handleSubmit}>
  <div>
    <label>
      <Input
        type="text"
        bind:value={link}
        onchange={() => (errorMsg = "")}
        required
        disabled={loading}
        placeholder="Enter Canvas Calendar link"
      />
    </label>
    <Button type="submit" disabled={loading}>Continue -></Button>
  </div>
</form>

<div class="mt-4">
  <p class="text-gray-600 mb-2">Or upload an .ics file:</p>
  <input
    type="file"
    accept=".ics"
    bind:files
    onchange={handleFileUpload}
    disabled={loading}
    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
</div>

{#if errorMsg}
  <p class="text-red-500 mt-2">{errorMsg}</p>
{/if}

<Footer />

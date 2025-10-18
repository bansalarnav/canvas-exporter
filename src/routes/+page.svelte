<script lang="ts">
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import InputForm from "./InputForm.svelte";

  // my link: https://canvas.illinois.edu/feeds/calendars/user_RB0ENimJA7zwpPennAAWaa4B7IFkYNcUB11SeLT6.ics
  function next(icsText: string) {
    console.log(icsText);
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

    <div class="rounded-lg border border-border bg-card p-6 sm:p-8">
      <InputForm {next} />
    </div>

    <p class="text-center text-xs text-muted-foreground mt-[-10px]">
      All data is processed directly in your browser and is never sent to any
      server.
    </p>
  </div>
</main>
<Footer />

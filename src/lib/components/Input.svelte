<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";

  export type InputProps = HTMLInputAttributes;
</script>

<script lang="ts">
  let { value = $bindable(), class: className, ...rest }: InputProps = $props();
</script>

<input bind:value class={["border border-gray-300 p-2", className]} {...rest} />

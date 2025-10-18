<script lang="ts" module>
  import type { HTMLButtonAttributes } from "svelte/elements";

  export type ButtonProps = HTMLButtonAttributes & {
    loading?: boolean;
  };
</script>

<script lang="ts">
  import Loader from "./Loader.svelte";

  let {
    children,
    class: className,
    loading = false,
    ...rest
  }: ButtonProps = $props();
</script>

<button
  {...rest}
  class={[
    "bg-[#000] text-white cursor-pointer py-[12px] px-[18px] rounded-md hover:bg-[#2A2A2A] transition-all",
    { "bg-[#2a2a2a]": loading || rest.disabled },
    className,
  ]}
  disabled={loading || rest.disabled}
>
  <span class="inline-flex items-center justify-center relative">
    <span class={loading ? "opacity-0" : ""}>
      {@render children?.()}
    </span>
    {#if loading}
      <span class="absolute inset-0 flex items-center justify-center">
        <Loader size={16} />
      </span>
    {/if}
  </span>
</button>

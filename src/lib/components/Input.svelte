<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";

  export type InputProps = HTMLInputAttributes;
</script>

<script lang="ts">
  let { value = $bindable(), class: className, ...rest }: InputProps = $props();
</script>

<input
  bind:value
  class={[
    "border-[2px] border-[#E4E7EB] px-[12px] py-[10px] bg-[#F5F7FA] rounded-md w-full",
    className,
  ]}
  {...rest}
/>

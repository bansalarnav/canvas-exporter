<script lang="ts" module>
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";

  export type ButtonProps = HTMLButtonAttributes;
</script>

<script lang="ts">
  let { children, class: className, ...rest }: ButtonProps = $props();
</script>

<button {...rest} class={["bg-[#f00]", className]}>
  {@render children?.()}
</button>

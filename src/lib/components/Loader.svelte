<script lang="ts" module>
  export type LoaderProps = {
    color?: string;
    unit?: string;
    duration?: string;
    size?: string | number;
    pause?: boolean;
  };
</script>

<script lang="ts">
  const range = (size: number, startAt = 0) =>
    [...Array(size).keys()].map((i) => i + startAt);

  const {
    color = "#fff",
    unit = "px",
    duration = "1.25s",
    size = 60,
    pause = false,
  }: LoaderProps = $props();

  const durationUnitRegex = /[a-zA-Z%]+/;
  let durationUnit: string = duration.match(durationUnitRegex)?.[0] ?? "s";
  let durationNum: string = duration.replace(durationUnitRegex, "");
</script>

<div
  class="wrapper"
  style="--size: {size}{unit}; --color: {color}; --duration: {duration}"
>
  {#each range(3, 0) as version}
    <div
      class="cube"
      class:pause-animation={pause}
      style="animation-delay: {version *
        (+durationNum / 10)}{durationUnit}; left: {version *
        (+size / 3 + +size / 15) +
        unit};"
    ></div>
  {/each}
</div>

<style>
  .wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--size);
    height: calc(var(--size) / 2.5);
  }
  .cube {
    position: absolute;
    top: 0px;
    width: calc(var(--size) / 5);
    height: calc(var(--size) / 2.5);
    background-color: var(--color);
    animation: motion var(--duration) cubic-bezier(0.895, 0.03, 0.685, 0.22)
      infinite;
  }
  .pause-animation {
    animation-play-state: paused;
  }
  @keyframes motion {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>

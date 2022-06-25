<script lang="ts">
  import { beforeUpdate } from 'svelte';

  export let value = 0;
  let bar: HTMLSpanElement | undefined;

  beforeUpdate(() => {
    if (bar && value === 0) {
      bar.style.transitionDuration = '0ms';
      bar.style.width = '0%';
      bar.offsetHeight;
      bar.style.transitionDuration = '150ms';
    }
  });
</script>

<div class="progress-bar">
  <span style="width: {value}%" bind:this={bar} />
</div>

<style lang="scss">
  .progress-bar {
    position: relative;
    width: 100%;
    height: 5px;
    border-radius: 2.5px;
    overflow: hidden;
    background-color: var(--interactive-normal);
  }

  .progress-bar span {
    display: block;
    position: absolute;
    left: 0;
    height: 100%;
    background-color: var(--interactive-accent);
    transition: width 150ms ease-in-out;
  }
</style>

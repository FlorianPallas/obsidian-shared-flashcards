<script lang="ts">
  export let value = 0;
</script>

<div class="progress-bar">
  <span style="width: {value}%" />
</div>

<style lang="scss">
  .progress-bar {
    position: relative;
    width: 100%;
    height: 7.5px;
    border-radius: 7.5px;
    overflow: hidden;
  }

  .progress-bar span {
    display: block;
    position: absolute;
    left: 0;
    height: 100%;
    background-color: var(--interactive-accent);
    transition: width 150ms ease-out;
  }
</style>

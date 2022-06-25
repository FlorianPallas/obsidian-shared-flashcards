<script lang="ts">
  export let message = '';
  export let onScan = () => {};
  export let onPush = () => {};
</script>

<div class="toolbar">
  <button on:click={onScan}>
    <svg viewBox="0 0 48 48">
      <path
        d="M24 40Q17.35 40 12.675 35.325Q8 30.65 8 24Q8 17.35 12.675 12.675Q17.35 8 24 8Q28.25 8 31.45 9.725Q34.65 11.45 37 14.45V8H40V20.7H27.3V17.7H35.7Q33.8 14.7 30.85 12.85Q27.9 11 24 11Q18.55 11 14.775 14.775Q11 18.55 11 24Q11 29.45 14.775 33.225Q18.55 37 24 37Q28.15 37 31.6 34.625Q35.05 32.25 36.4 28.35H39.5Q38.05 33.6 33.75 36.8Q29.45 40 24 40Z"
      />
    </svg>
  </button>
  <button on:click={onPush}>
    <svg viewBox="0 0 48 48">
      <path
        d="M11 40Q9.8 40 8.9 39.1Q8 38.2 8 37V29.85H11V37Q11 37 11 37Q11 37 11 37H37Q37 37 37 37Q37 37 37 37V29.85H40V37Q40 38.2 39.1 39.1Q38.2 40 37 40ZM22.5 32.35V13.8L16.5 19.8L14.35 17.65L24 8L33.65 17.65L31.5 19.8L25.5 13.8V32.35Z"
      />
    </svg>
  </button>
  <p>{message}</p>
</div>

<style lang="scss">
  .toolbar {
    display: flex;
    flex-flow: row;
    width: 100%;
    height: 25px;
    margin-bottom: 5px;
  }

  .toolbar button {
    padding: 3px;
    margin: 0;
    margin-right: 5px;
    cursor: pointer;
  }

  .toolbar svg {
    fill: #fff;
    height: 100%;
    width: 100%;
  }

  .toolbar p {
    margin: auto 0;
    font-size: 12px;
  }
</style>

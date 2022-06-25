<script lang="ts">
  import ProgressBar from './components/progress-bar.svelte';
  import Toolbar from './components/toolbar.svelte';
  import FlashcardsPlugin from 'src';
  import { Stage } from '.';

  export let plugin: FlashcardsPlugin;

  export let stage: Stage = 'none';

  const messages: Map<Stage, string> = new Map([
    ['none', 'Ready'],
    ['prepare', 'Preparing'],
    ['parse', 'Gathering cards'],
    ['categorize', 'Comparing with Anki'],
    ['done', 'Done'],
  ]);

  const progress: Map<Stage, number> = new Map([
    ['none', 0],
    ['prepare', 0],
    ['parse', 33],
    ['categorize', 66],
    ['done', 100],
  ]);
</script>

<main>
  <Toolbar
    message={messages.get(stage)}
    onScan={() => plugin.onScan()}
    onPush={() => plugin.onPush()}
  />
  <ProgressBar value={progress.get(stage)} />
  <div />
</main>

<style lang="scss">
  main {
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>

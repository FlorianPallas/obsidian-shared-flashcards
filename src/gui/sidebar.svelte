<script lang="ts">
  import ArticleList from './components/article-list/article-list.svelte';
  import ProgressBar from './components/progress-bar.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { Wiki } from 'src/entities/wiki';
  import Toolbar from './components/toolbar/toolbar.svelte';
  import FlashcardsPlugin from 'src';

  export let plugin: FlashcardsPlugin;

  let progress = 0;
  let wiki: Wiki | null = null;
  let cardCount = 0;

  function onProgress(event: Event) {
    const { loaded, total } = event as ProgressEvent;
    progress = (loaded / total) * 100;
  }

  function onUpdate(event: Event) {
    const { detail } = event as CustomEvent<{ wiki: Wiki }>;
    wiki = detail.wiki;

    cardCount = 0;
    for (const article of wiki.articles) {
      cardCount += article.cards.length;
    }
  }

  onMount(() => {
    addEventListener('flashcards-progress', onProgress);
    addEventListener('flashcards-update', onUpdate);
  });

  onDestroy(() => {
    removeEventListener('flashcards-progress', onProgress);
    removeEventListener('flashcards-update', onUpdate);
  });
</script>

<main>
  <Toolbar onScan={() => plugin.onScan()} onPush={() => plugin.onPush()} />
  <ProgressBar value={progress} />
  {#if wiki !== null}
    <p>Found {cardCount} card(s) in {wiki.articles.length} article(s)</p>
    <ArticleList articles={wiki.articles.filter((a) => a.cards.length > 0)} />
  {/if}
</main>

<style lang="scss">
  main {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>

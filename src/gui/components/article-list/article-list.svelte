<script lang="ts">
  import { Article } from 'src/entities/article';
  import ArticleListItem from './article-list-item.svelte';

  export let articles: Article[] = [];
</script>

<div class="article-list">
  <ul>
    {#each articles as article}
      <ArticleListItem {article} />
    {/each}
  </ul>
</div>

<style lang="scss">
</style>

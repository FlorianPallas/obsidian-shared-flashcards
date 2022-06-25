<script lang="ts">
  import { Article } from 'src/entities/article';

  export let article: Article;
</script>

<ul class="article-list-item">
  {#each article.cards as card}
    <li>{card.front}</li>
  {/each}
</ul>

<style lang="scss">
</style>

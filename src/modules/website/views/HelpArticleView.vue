<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useSchemaOrg } from '@/composables/useSchemaOrg'
import { useHelpArticles } from '@/modules/website/composables/useHelpArticles'

const route = useRoute()
const { getArticle } = useHelpArticles()
const { injectHelpArticleSchema } = useSchemaOrg()

const article = computed(() => getArticle(route.params.slug as string))

if (article.value) {
  useHead({
    title: `${article.value.title} — QueueBuzz Help`,
    meta: [{ name: 'description', content: article.value.description }],
  })
  injectHelpArticleSchema(article.value)
}
</script>

<template>
  <div class="legal-page">
    <section class="mx-auto max-w-[720px] px-5 pt-10 pb-8 md:px-0 md:pt-[80px] md:pb-[48px]">
      <RouterLink
        :to="{ name: 'help-center' }"
        class="inline-flex items-center gap-1.5 font-body text-sm text-plum-muted hover:text-plum mb-6"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        Help Center
      </RouterLink>

      <template v-if="article">
        <h1
          class="font-display font-bold text-plum text-[28px] md:text-[40px] tracking-[-0.02em] leading-tight mb-3"
        >
          {{ article.title }}
        </h1>
      </template>
      <template v-else>
        <h1 class="font-display font-bold text-plum text-[28px] md:text-[40px] mb-3">
          Article not found
        </h1>
        <p class="font-body text-plum-muted text-[14px] md:text-[16px]">
          This help article doesn't exist or may have been moved.
        </p>
      </template>
    </section>

    <section v-if="article" class="mx-auto max-w-[720px] px-5 pb-[48px] md:px-0 md:pb-[80px]">
      <!-- eslint-disable-next-line vue/no-v-html -- article.html is DOMPurify-sanitized in useHelpArticles -->
      <div class="help-article-content" v-html="article.html" />
    </section>
  </div>
</template>

<style scoped>
.help-article-content {
  font-family: var(--font-body);
  color: var(--color-plum);
  font-size: 15px;
  line-height: 1.7;
}
.help-article-content :deep(h2) {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--color-plum);
  margin-top: 32px;
  margin-bottom: 10px;
}
.help-article-content :deep(h3) {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  color: var(--color-plum);
  margin-top: 24px;
  margin-bottom: 8px;
}
.help-article-content :deep(p) {
  margin-bottom: 12px;
}
.help-article-content :deep(ul),
.help-article-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 12px;
}
.help-article-content :deep(li) {
  margin-bottom: 6px;
}
.help-article-content :deep(li) > :deep(ul),
.help-article-content :deep(li) > :deep(ol) {
  margin-top: 6px;
}
.help-article-content :deep(a) {
  color: var(--color-mint-dark);
  text-decoration: underline;
}
.help-article-content :deep(code) {
  background: var(--color-plum-faint);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 13px;
}
.help-article-content :deep(strong) {
  font-weight: 700;
}
</style>

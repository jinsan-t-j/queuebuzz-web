<script setup lang="ts">
defineProps<{
  metrics: { value: string; label: string }[]
}>()
</script>

<template>
  <section id="impact" class="py-16 lg:py-24">
    <div class="container mx-auto px-6">
      <div class="grid gap-12 sm:grid-cols-3 text-center">
        <div v-for="m in metrics" :key="m.label" class="p-8">
          <div class="font-display text-5xl font-black text-plum mb-2 md:text-7xl">
            {{ m.value }}
          </div>
          <div class="font-body text-sm font-bold uppercase tracking-widest text-plum-soft">
            {{ m.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

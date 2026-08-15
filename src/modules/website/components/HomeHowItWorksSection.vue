<script setup lang="ts">
import LineIcon from '@/modules/website/components/icons/LineIcon.vue'

defineProps<{ isVisible: boolean }>()

const steps = [
  {
    icon: 'clipboard' as const,
    title: 'Create your queue',
    text: 'Set your business name, logo, and service categories in under 60 seconds. No complex setup required.',
  },
  {
    icon: 'qr' as const,
    title: 'Display & join',
    text: 'Customers scan your unique QR code at the door. They join instantly on their phone — no apps, no accounts.',
  },
  {
    icon: 'bell' as const,
    title: 'Call & serve',
    text: 'Call the next person with one click. They receive a notification instantly, and your lobby stays perfectly clear.',
  },
]
</script>

<template>
  <section id="how-it-works" class="py-20 lg:py-28 relative z-10 overflow-hidden">
    <div
      class="container mx-auto px-6 relative transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="max-w-2xl mb-16">
        <p class="font-body text-sm font-semibold text-plum-muted mb-3">The workflow</p>
        <h2 class="font-editorial text-4xl font-bold md:text-5xl text-plum">
          Three steps to <span class="text-mint-dark">zero lines.</span>
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        <div v-for="(step, i) in steps" :key="step.title" class="relative">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b-2 border-plum-faint">
            <span class="font-editorial text-sm font-bold text-plum-muted">0{{ i + 1 }}</span>
            <LineIcon :name="step.icon" class="h-6 w-6 text-plum ml-auto" />
          </div>
          <h3 class="font-editorial text-xl font-bold mb-3 text-plum">{{ step.title }}</h3>
          <p class="font-body text-plum-soft text-sm leading-relaxed">
            {{ step.text }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

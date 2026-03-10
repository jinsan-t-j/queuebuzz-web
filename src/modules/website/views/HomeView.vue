<script setup>
/**
 * @component HomeView
 * @description Public landing page for QueueBuzz. Shows the hero section,
 * features overview, and call-to-action for new hosts.
 */

import BaseButton from '@/components/base/BaseButton.vue'

</script>

<template>
  <div class="">
    <!-- Hero Section -->
    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <h1 class="font-display text-5xl font-black leading-tight text-plum md:text-7xl">
        Let's make waiting
        <span class="text-mint">feel <br>like a breeze.</span>
      </h1>
      <p class="mx-auto mt-6 max-w-2xl font-body text-lg text-plum-muted">
        Create a virtual queue in seconds. Your customers join from their phone — no app download, no sign-up needed.
      </p>
      <div class="mt-10 flex items-center justify-center gap-4">
        <router-link to="/guest-host/queue/create">
          <BaseButton variant="primary" size="lg">
            Start Queue Instantly
          </BaseButton>
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="mx-auto max-w-7xl px-6 py-16">
      <div class="grid gap-8 md:grid-cols-3">
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">01</span>
          </div>
          <h3 class="font-display text-lg font-bold text-plum">Create a Queue</h3>
          <p class="mt-2 font-body text-sm text-plum-muted">
            Open your dashboard, name your queue, and you're live in seconds.
          </p>
        </div>
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">02</span>
          </div>
          <h3 class="font-display text-lg font-bold text-plum">Customers Join</h3>
          <p class="mt-2 font-body text-sm text-plum-muted">
            Share a QR code or join code. Customers enter from their mobile browser.
          </p>
        </div>
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">03</span>
          </div>
          <h3 class="font-display text-lg font-bold text-plum">Call Next</h3>
          <p class="mt-2 font-body text-sm text-plum-muted">
            Manage the line from your dashboard. Customers get notified instantly.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-plum py-20 text-center">
      <h2 class="font-display text-3xl font-bold text-white md:text-4xl">
        No sign-up hassle. Just start.
      </h2>
      <p class="mx-auto mt-4 max-w-xl font-body text-plum-muted">
        QueueBuzz is free for single queues. Go Premium when you need more.
      </p>
      <div class="mt-8">
        <router-link to="/login">
          <BaseButton variant="primary" size="lg">
            Get Started Free
          </BaseButton>
        </router-link>
      </div>
    </section>
  </div>
</template>

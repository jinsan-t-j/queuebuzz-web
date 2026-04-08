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
        <span class="text-mint">feel <br />like a breeze.</span>
      </h1>
      <p class="mx-auto mt-6 max-w-2xl font-body text-lg text-plum-muted">
        Create a virtual queue in seconds. Your customers join from their phone — no app download,
        no sign-up needed.
      </p>
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <router-link to="/guest-host/queue/create">
          <BaseButton variant="primary" size="lg" class="w-full sm:w-auto px-10">
            Start Queue Instantly
          </BaseButton>
        </router-link>
        <router-link to="/join">
          <BaseButton
            variant="ghost"
            size="lg"
            class="w-full sm:w-auto px-10 border border-plum-faint"
          >
            Join a Queue
          </BaseButton>
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section v-once class="mx-auto max-w-7xl px-6 py-16">
      <div class="grid gap-8 md:grid-cols-3">
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">01</span>
          </div>
          <h2 class="font-display text-lg font-bold text-plum">Create a Queue</h2>
          <p class="mt-2 font-body text-sm text-plum-soft">
            Open your dashboard, name your queue, and you're live in seconds.
          </p>
        </div>
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">02</span>
          </div>
          <h2 class="font-display text-lg font-bold text-plum">Customers Join</h2>
          <p class="mt-2 font-body text-sm text-plum-soft">
            Share a QR code or join code. Customers enter from their mobile browser.
          </p>
        </div>
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">03</span>
          </div>
          <h2 class="font-display text-lg font-bold text-plum">Call Next</h2>
          <p class="mt-2 font-body text-sm text-plum-soft">
            Manage the line from your dashboard. Customers get notified instantly.
          </p>
        </div>
      </div>
    </section>

    <!-- Join by Code Section (Customer Focused) -->
    <section v-once class="mx-auto max-w-4xl px-6 py-24">
      <div
        class="relative overflow-hidden rounded-[40px] bg-white p-12 text-center shadow-[0_32px_64px_-16px_rgba(26,10,46,0.1)] border border-plum-faint"
      >
        <!-- Decoration -->
        <div
          class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mint-light/50 blur-3xl opacity-60"
        />
        <div
          class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-plum/5 blur-3xl opacity-60"
        />

        <div class="relative z-10">
          <h2 class="font-display text-4xl font-bold text-plum">Are you a Guest?</h2>
          <p class="mx-auto mt-4 max-w-md font-body text-plum-soft text-lg">
            Scan a QR code at the business or enter a 6-character code below to join the line.
          </p>

          <div class="mt-10 mx-auto max-w-sm">
            <router-link to="/join">
              <div
                class="flex h-16 w-full items-center justify-between rounded-2xl border-2 border-dashed border-plum-faint bg-sand/30 px-6 cursor-pointer hover:border-mint hover:bg-mint-light/10 transition-all duration-300"
              >
                <span class="font-mono text-xl font-bold tracking-[0.25em] text-plum-soft uppercase"
                  >ENTER-CODE</span
                >
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-plum text-white shadow-lg"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-once class="bg-plum py-20 text-center">
      <h2 class="font-display text-3xl font-bold text-white md:text-4xl">
        No sign-up hassle. Just start.
      </h2>
      <p class="mx-auto mt-4 max-w-xl font-body text-plum-faint">
        QueueBuzz is free for single queues. Go Premium when you need more.
      </p>
      <div class="mt-8">
        <router-link to="/login">
          <BaseButton variant="primary" size="lg"> Get Started Free </BaseButton>
        </router-link>
      </div>
    </section>
  </div>
</template>

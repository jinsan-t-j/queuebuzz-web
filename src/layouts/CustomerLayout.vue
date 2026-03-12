<script setup>
/**
 * @component CustomerLayout
 * @description Wraps all customer-facing screens (join, waiting, ticket, called, served, join-by-code).
 * Provides the centred mobile column, navbar at top, footer at bottom, and blob decorations.
 */

// 5. Component imports
import CustomerNavbar from '@/components/layout/customer/CustomerNavbar.vue'
import CustomerFooter from '@/components/layout/customer/CustomerFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-hidden bg-sand">
    <!-- Navbar -->
    <CustomerNavbar />

    <!-- Centred mobile column -->
    <main class="relative mx-auto w-full max-w-[430px] flex-1 px-0">
      <!-- Blob decorations — atmospheric, behind all content -->
      <div
        class="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50"
      />
      <div
        class="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40"
      />

      <!-- View content injected here -->
      <RouterView />
    </main>

    <!-- Footer -->
    <CustomerFooter />
  </div>
</template>

<script setup>
/**
 * @component CustomerLayout
 * @description Wraps all customer-facing screens (join, waiting, ticket, called, served, join-by-code).
 */

// 5. Component imports
import CustomerNavbar from '@/components/layout/customer/CustomerNavbar.vue'
import CustomerFooter from '@/components/layout/customer/CustomerFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-sand">
    <!-- Navbar -->
    <CustomerNavbar />

    <!-- Centred mobile column -->
    <main class="relative mx-auto w-full max-w-[430px] flex-1 px-0">
      
      <!-- View content injected here — each view adds its own blobs -->
      <RouterView />
    </main>

    <!-- Footer -->
    <CustomerFooter />
  </div>
</template>

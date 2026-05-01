<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import CustomerNavbar from '@/components/layout/customer/CustomerNavbar.vue'
import CustomerFooter from '@/components/layout/customer/CustomerFooter.vue'

const SystemAlertBanner = defineAsyncComponent(
  () => import('@/components/base/SystemAlertBanner.vue'),
)

const showMaintenanceBanner = import.meta.env.VITE_SHOW_MAINTENANCE_BANNER === 'true'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-sand">
    <SystemAlertBanner v-if="showMaintenanceBanner" />
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

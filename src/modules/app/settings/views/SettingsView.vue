<script setup>
/**
 * @component SettingsView
 * @description Host account settings page. Rendered using the abstracted
 * SettingsForm component.
 */

import SettingsForm from '@/modules/app/settings/components/SettingsForm.vue'
</script>

<template>
  <div class="mx-auto max-w-[752px] pb-24">
    <!-- ═══ Page Title ═══ -->
    <div class="mb-10">
      <h1 class="font-display text-4xl text-plum">Host Settings</h1>
      <p class="mt-2 font-body text-base text-[#64748b]">
        Manage your account preferences and queue configurations.
      </p>
    </div>

    <SettingsForm />
  </div>
</template>

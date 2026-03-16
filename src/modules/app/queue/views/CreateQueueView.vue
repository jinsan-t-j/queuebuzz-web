<script setup>
/**
 * @component CreateQueueView
 * @description New queue creation form. Uses CreateQueueForm to handle
 * validation and submission logic.
 */

import CreateQueueForm from '@/modules/app/queue/components/CreateQueueForm.vue'

</script>

<template>
  <div class="mx-auto max-w-[680px]">
    <h1 class="font-display text-[40px] font-extrabold text-plum">
      Let's get started.
    </h1>

    <CreateQueueForm role="host" />
  </div>
</template>

<script setup lang="ts">
/**
 * @component QueueFilterDropdown
 * @description Dropdown menu for sorting and filtering the live queue by party size.
 */
import CheckIcon from '@/assets/icons/check-circle.svg?component'

defineProps<{
  sortMode: 'position' | 'size-asc' | 'size-desc'
  partySizeFilter: number | 'all'
  availablePartySizes: number[]
}>()

const emit = defineEmits<{
  (e: 'update:sortMode', value: 'position' | 'size-asc' | 'size-desc'): void
  (e: 'update:partySizeFilter', value: number | 'all'): void
  (e: 'close'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div
    class="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-2xl border border-plum-faint bg-white p-2 shadow-[0_20px_50px_rgba(26,10,46,0.15)] focus:outline-none"
  >
    <!-- Sort Section -->
    <div class="px-3 py-2">
      <p class="text-[10px] font-bold uppercase tracking-widest text-plum-muted/60">
        Sort Guests By
      </p>
    </div>
    <div class="space-y-1">
      <button
        class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-body text-sm transition-colors"
        :class="
          sortMode === 'position'
            ? 'bg-plum-faint/50 text-plum font-bold'
            : 'text-plum-muted hover:bg-plum-faint/30 hover:text-plum'
        "
        @click="
          emit('update:sortMode', 'position')
          emit('close')
        "
      >
        <span>Default (Arrival)</span>
        <CheckIcon v-if="sortMode === 'position'" class="h-4 w-4 text-mint" />
      </button>
      <button
        class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-body text-sm transition-colors"
        :class="
          sortMode === 'size-asc'
            ? 'bg-plum-faint/50 text-plum font-bold'
            : 'text-plum-muted hover:bg-plum-faint/30 hover:text-plum'
        "
        @click="
          emit('update:sortMode', 'size-asc')
          emit('close')
        "
      >
        <span>Size: Small to Large</span>
        <CheckIcon v-if="sortMode === 'size-asc'" class="h-4 w-4 text-mint" />
      </button>
      <button
        class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-body text-sm transition-colors"
        :class="
          sortMode === 'size-desc'
            ? 'bg-plum-faint/50 text-plum font-bold'
            : 'text-plum-muted hover:bg-plum-faint/30 hover:text-plum'
        "
        @click="
          emit('update:sortMode', 'size-desc')
          emit('close')
        "
      >
        <span>Size: Large to Small</span>
        <CheckIcon v-if="sortMode === 'size-desc'" class="h-4 w-4 text-mint" />
      </button>
    </div>

    <div class="my-2 border-t border-plum-faint" />

    <!-- Filter Section -->
    <div class="px-3 py-2">
      <p class="text-[10px] font-bold uppercase tracking-widest text-plum-muted/60">
        Filter By Size
      </p>
    </div>
    <div class="flex flex-wrap gap-2 p-2">
      <button
        class="rounded-lg px-2.5 py-1 font-body text-xs font-bold transition-all"
        :class="
          partySizeFilter === 'all'
            ? 'bg-plum text-sand'
            : 'bg-plum-faint/40 text-plum-muted hover:bg-plum-faint/60'
        "
        @click="emit('update:partySizeFilter', 'all')"
      >
        All
      </button>
      <button
        v-for="size in availablePartySizes"
        :key="size"
        class="rounded-lg px-2.5 py-1 font-body text-xs font-bold transition-all"
        :class="
          partySizeFilter === size
            ? 'bg-plum text-sand'
            : 'bg-plum-faint/40 text-plum-muted hover:bg-plum-faint/60'
        "
        @click="emit('update:partySizeFilter', size)"
      >
        {{ size }}
      </button>
    </div>

    <div
      v-if="partySizeFilter !== 'all' || sortMode !== 'position'"
      class="mt-2 border-t border-plum-faint p-2"
    >
      <button
        class="flex w-full items-center justify-center rounded-lg py-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-danger hover:bg-danger/5"
        @click="emit('reset')"
      >
        Reset All
      </button>
    </div>
  </div>
</template>

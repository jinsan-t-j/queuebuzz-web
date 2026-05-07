<script setup lang="ts">
import { ref } from 'vue'
import {
  Filter as FilterIcon,
  ChevronDown as ChevronDownIcon,
  Check as CheckIcon,
} from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'

defineProps<{
  activeFilter: string
  filters: Array<{ value: string; label: string }>
}>()

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

function selectFilter(value: string) {
  emit('select', value)
  isOpen.value = false
}
</script>

<template>
  <div ref="dropdownRef" class="w-full md:w-auto relative">
    <button
      class="flex items-center gap-3 h-12 px-6 rounded-2xl border border-plum-faint font-body text-sm text-plum hover:border-plum hover:bg-white transition-all bg-white w-full md:w-[200px] justify-between shadow-none"
      @click="isOpen = !isOpen"
    >
      <span class="flex items-center gap-2 font-black">
        <FilterIcon class="w-4 h-4 text-plum-muted" />
        {{ filters.find((f) => f.value === activeFilter)?.label }}
      </span>
      <ChevronDownIcon
        class="w-4 h-4 text-plum-muted transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform translate-y-2 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-2 opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute top-full right-0 lg:right-0 mt-3 z-50 bg-white rounded-2xl border border-plum-faint shadow-xl p-1.5 min-w-[220px] w-full lg:w-auto"
      >
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-left',
            'font-body text-sm transition-all',
            activeFilter === filter.value
              ? 'bg-mint-light text-plum font-black'
              : 'text-plum-muted hover:bg-sand hover:text-plum',
          ]"
          @click="selectFilter(filter.value)"
        >
          {{ filter.label }}
          <CheckIcon v-if="activeFilter === filter.value" class="w-4 h-4 text-mint stroke-[3]" />
        </button>
      </div>
    </transition>
  </div>
</template>

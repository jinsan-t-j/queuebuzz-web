<script setup lang="ts">
/**
 * @component CustomerHeader
 * @description Consistent host branding header for customer-facing views.
 * Shows banner (if exists) and profile image with enlargement capability.
 */
import { ref } from 'vue'

import BaseAvatar from '@/components/base/BaseAvatar.vue'

import ProfileImageModal from './ProfileImageModal.vue'

withDefaults(
  defineProps<{
    name?: string | null
    profileUrl?: string | null
    bannerUrl?: string | null
    isLoading?: boolean
    hasBanner?: boolean
  }>(),
  {
    name: '',
    profileUrl: null,
    bannerUrl: null,
    isLoading: false,
    hasBanner: false,
  },
)

const isAvatarEnlarged = ref(false)
</script>

<template>
  <div class="w-full">
    <div class="relative w-full overflow-hidden rounded-b-[32px]">
      <!-- Shimmer/Loading State -->
      <template v-if="isLoading">
        <!-- Banner Layout Shimmer -->
        <div v-if="hasBanner" class="relative aspect-[16/6] w-full bg-plum-faint animate-pulse">
          <div class="absolute inset-0 bg-gradient-to-t from-plum/40 via-plum/10 to-transparent" />
          <div class="absolute bottom-4 left-5 flex items-center gap-3">
            <div
              class="h-10 w-10 shrink-0 rounded-full bg-white/30 ring-2 ring-white/20 animate-pulse"
            />
            <div class="h-5 w-32 rounded-lg bg-white/30 animate-pulse" />
          </div>
        </div>

        <!-- Simple Layout Shimmer -->
        <div v-else class="flex items-center justify-center gap-3 px-5 pb-2 pt-6">
          <div
            class="h-10 w-10 shrink-0 rounded-full bg-plum-faint ring-2 ring-plum-faint animate-pulse"
          />
          <div class="h-5 w-32 rounded-lg bg-plum-faint animate-pulse" />
        </div>
      </template>

      <!-- Populated State -->
      <template v-else>
        <!-- Banner Display -->
        <div v-if="bannerUrl" class="relative aspect-[16/6] w-full">
          <img
            :src="bannerUrl"
            alt="Banner"
            class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            fetchpriority="high"
            decoding="async"
          />
          <!-- Overlay for text readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-plum/60 via-plum/20 to-transparent" />

          <!-- Profile info overlaying banner -->
          <div class="absolute bottom-4 left-5 flex items-center gap-3">
            <BaseAvatar
              v-if="profileUrl"
              :src="profileUrl"
              :name="name || ''"
              size="md"
              class="h-10 w-10 shrink-0 ring-2 ring-white/80 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
              @click="isAvatarEnlarged = true"
            />
            <h1 class="font-display text-lg font-bold text-white drop-shadow-md">
              {{ name }}
            </h1>
          </div>
        </div>

        <!-- Simple Header (No Banner) -->
        <div v-else class="flex items-center justify-center gap-3 px-5 pb-2 pt-6">
          <BaseAvatar
            v-if="profileUrl"
            :src="profileUrl"
            :name="name || ''"
            size="md"
            class="h-10 w-10 shrink-0 ring-2 ring-plum-faint cursor-pointer transition-transform hover:scale-105 active:scale-95"
            @click="isAvatarEnlarged = true"
          />
          <h1 class="text-center font-display text-lg font-bold text-plum">
            {{ name }}
          </h1>
        </div>
      </template>
    </div>

    <!-- Enlarged Profile Modal -->
    <ProfileImageModal
      v-if="profileUrl && name"
      :is-open="isAvatarEnlarged"
      :image-url="profileUrl"
      :name="name"
      @close="isAvatarEnlarged = false"
    />
  </div>
</template>

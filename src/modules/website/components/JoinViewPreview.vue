<script setup lang="ts">
/**
 * @component JoinViewPreview
 * @description Interactive preview of the customer-facing JoinView.
 * Mirrors the layout of CustomerHeader + JoinQueueForm with real image
 * upload (via BaseImageCropper) and an inline-editable business name.
 *
 * Reusable: can be dropped into any context that needs a live brand preview.
 */
import { AtSign, Clock, Info, Upload, UserCircle2 } from 'lucide-vue-next'
import { defineAsyncComponent, ref } from 'vue'

import BaseToggle from '@/components/base/BaseToggle.vue'

const BaseImageCropper = defineAsyncComponent(
  () => import('@/components/base/BaseImageCropper.vue'),
)

const bannerPreview = ref<string | null>(null)
const avatarPreview = ref<string | null>(null)
const cropperOpen = ref<'banner' | 'avatar' | null>(null)
const cropperSrc = ref<string | null>(null)
const brandTitle = ref('Sakura Café')
const mockBuzzEnabled = ref(true)
const partySize = ref(4)

function openFilePicker(type: 'banner' | 'avatar') {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      cropperSrc.value = ev.target?.result as string
      cropperOpen.value = type
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function onCrop(dataUrl: string) {
  if (cropperOpen.value === 'banner') bannerPreview.value = dataUrl
  if (cropperOpen.value === 'avatar') avatarPreview.value = dataUrl
  closeCropper()
}

function closeCropper() {
  cropperOpen.value = null
  cropperSrc.value = null
}
</script>

<template>
  <!--
    Outer shell: bg-sand + blobs matching JoinView exactly.
    Not scrollable here — the parent decides height/scroll context.
  -->
  <div class="relative w-full bg-[#F7F3EE] rounded-[40px] overflow-hidden">
    <!-- Scrollable content — banner scrolls WITH the rest, not sticky -->
    <div class="relative z-10 overflow-y-auto max-h-[480px]">
      <!-- ── CustomerHeader ───────────────────────────────────────────────── -->
      <div
        class="relative w-full overflow-hidden bg-plum-faint rounded-b-[32px] shadow-sm flex-shrink-0"
      >
        <div
          class="group/banner relative w-full cursor-pointer"
          style="aspect-ratio: 16/6"
          @click="openFilePicker('banner')"
        >
          <!-- Banner image -->
          <img
            v-if="bannerPreview"
            :src="bannerPreview"
            alt="Banner"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/banner:scale-105"
          />

          <!-- Gradient overlay — only when banner image exists so text stays legible -->
          <div
            v-if="bannerPreview"
            class="absolute inset-0 bg-gradient-to-t from-plum/60 via-plum/20 to-transparent"
          />

          <!-- Empty state -->
          <div
            v-if="!bannerPreview"
            class="absolute inset-0 flex items-center justify-center opacity-30 group-hover/banner:opacity-60 transition-opacity"
          >
            <div class="flex items-center gap-1.5">
              <Upload class="h-4 w-4 text-plum" />
              <span class="font-body text-[10px] font-semibold text-plum">Add banner</span>
            </div>
          </div>

          <!-- Filled state: hover to change -->
          <div
            v-if="bannerPreview"
            class="absolute inset-0 flex items-center justify-center bg-plum/30 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]"
          >
            <div class="flex items-center gap-1 bg-white/90 rounded-full px-2.5 py-1">
              <Upload class="h-2.5 w-2.5 text-plum" />
              <span class="font-body text-[9px] font-bold text-plum">Change banner</span>
            </div>
          </div>

          <!-- Avatar + editable name — always bottom-4 left-5 -->
          <div class="absolute bottom-4 left-5 flex items-center gap-3">
            <div
              class="group/avatar relative h-10 w-10 rounded-full ring-2 shadow-lg overflow-hidden bg-mint-light flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
              :class="bannerPreview ? 'ring-white/80' : 'ring-plum/20'"
              @click.stop="openFilePicker('avatar')"
            >
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                class="h-full w-full object-cover"
                alt="Avatar"
              />
              <Upload v-else class="h-3.5 w-3.5 text-plum" />
              <div
                class="absolute inset-0 flex items-center justify-center bg-plum/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity"
              >
                <Upload class="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <input
              v-model="brandTitle"
              type="text"
              placeholder="Business Name"
              aria-label="Business Name"
              class="bg-transparent font-display text-lg font-bold drop-shadow-md outline-none border-b border-dashed border-white/30 focus:border-white focus:ring-0 p-0 h-auto w-44 transition-all cursor-text"
              :class="
                bannerPreview ? 'text-white placeholder-white/50' : 'text-plum placeholder-plum/50'
              "
              @click.stop
            />
          </div>
        </div>
      </div>

      <!-- ── JoinQueueForm mock ────────────────────────────────────────────── -->
      <div class="flex flex-col gap-2.5 px-3.5 py-3">
        <!-- Stats card -->
        <div class="rounded-2xl border border-plum-faint bg-white p-3 text-center">
          <p class="font-body text-[8px] font-semibold uppercase tracking-[2px] text-plum-soft">
            People in Queue
          </p>
          <p class="font-display text-3xl font-normal leading-none text-plum mt-1">7</p>
          <div
            class="mx-auto mt-1 flex w-fit items-center gap-1 rounded-full border border-plum-faint/50 bg-sand px-2.5 py-0.5"
          >
            <Clock class="h-2.5 w-2.5 text-mint-dark" />
            <span class="font-mono text-[11px] font-bold text-plum">~12 min</span>
            <span class="font-body text-[11px] text-plum-soft">Wait</span>
          </div>
          <p class="mt-1 font-body text-[8px] leading-tight text-plum-muted">
            Your wait time is estimated,<br />it may slightly shift as the queue moves.
          </p>
        </div>

        <!-- Secure your spot -->
        <p class="font-body text-xs font-bold text-plum mt-0.5">Secure your spot</p>

        <!-- Name input -->
        <div
          class="flex items-center gap-2.5 rounded-2xl border border-plum-faint bg-white px-3 py-2"
        >
          <div class="h-6 w-6 rounded-full bg-plum-faint flex items-center justify-center shrink-0">
            <UserCircle2 class="h-3 w-3 text-plum-muted" />
          </div>
          <div>
            <p class="font-body text-[11px] text-plum-muted/60 leading-none">
              What should we call you?
            </p>
            <p class="font-body text-[8px] text-plum-muted mt-0.5">Appears as Guest if skipped</p>
          </div>
        </div>

        <!-- Party Joining Row -->
        <div
          class="flex items-center justify-between rounded-2xl border border-plum-faint bg-white px-3 py-2"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning/10"
            >
              <svg
                class="h-3.5 w-3.5 text-warning"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p class="font-body text-xs font-semibold text-plum">Joining with others?</p>
              <p class="font-body text-[9px] text-plum-muted">Add companions to your spot</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-plum-faint text-xs font-bold text-plum transition-opacity disabled:opacity-30"
              aria-label="Decrease party size"
              @click="partySize = Math.max(1, partySize - 1)"
            >
              −
            </button>
            <span class="min-w-[14px] text-center font-mono text-xs font-bold text-plum">
              {{ partySize }}
            </span>
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-plum-faint text-xs font-bold text-plum transition-opacity disabled:opacity-30"
              aria-label="Increase party size"
              @click="partySize++"
            >
              +
            </button>
          </div>
        </div>

        <!-- Buzz toggle card -->
        <div
          class="flex items-center justify-between rounded-2xl border border-plum-faint bg-white px-3 py-2"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint-light"
            >
              <svg class="h-3.5 w-3.5 text-mint" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C10.9 2 10 2.9 10 4V4.29C7.12 5.15 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.15 14 4.29V4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z"
                />
              </svg>
            </div>
            <div>
              <p class="font-body text-xs font-semibold text-plum">Buzz me when ready</p>
              <p class="font-body text-[9px] text-plum-muted">Get notified when it's your turn</p>
            </div>
          </div>
          <div class="flex items-center shrink-0">
            <BaseToggle
              v-model="mockBuzzEnabled"
              aria-label="Toggle haptic vibration buzz notifications"
            />
          </div>
        </div>

        <!-- Contact & Recovery Section -->
        <div class="flex flex-col gap-1">
          <div class="rounded-2xl border border-plum-faint bg-white overflow-hidden">
            <!-- Email Input Row -->
            <div class="flex items-center gap-2.5 px-3 py-1.5">
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum-faint"
              >
                <AtSign class="h-3 w-3 text-plum-muted" />
              </div>
              <div class="flex-1">
                <input
                  type="email"
                  placeholder="Email (optional, for recovery)"
                  class="w-full border-none bg-transparent font-body text-xs text-plum placeholder:text-plum-muted/40 focus:outline-none"
                />
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-plum-faint" />

            <!-- Phone Input Row -->
            <div class="flex items-center gap-2.5 px-3 py-1.5">
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum-faint"
              >
                <svg
                  class="h-3 w-3 text-plum-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <input
                  type="tel"
                  placeholder="Phone number (optional, for updates)"
                  class="w-full border-none bg-transparent font-body text-xs text-plum placeholder:text-plum-muted/40 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Info/Recovery Notice under Card -->
          <div class="flex items-start gap-1 px-0.5 mt-0.5">
            <Info class="mt-0.5 h-3 w-3 shrink-0 text-plum-muted/80" />
            <p class="font-body text-[9px] leading-tight text-plum-muted/80">
              Email is used to recover your spot if you close the browser.
            </p>
          </div>
        </div>

        <!-- Join CTA -->
        <button
          type="button"
          class="w-full rounded-xl bg-mint font-body text-xs font-semibold text-on-mint shadow-[0_4px_16px_rgba(0,229,160,0.40)] flex items-center justify-center gap-1.5 px-4 py-2.5"
        >
          Join the Queue
          <svg
            class="h-3.5 w-3.5 text-on-mint"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Mini footer -->
        <div class="border-t border-plum-faint/50 pt-2 text-center space-y-0.5 pb-1">
          <p class="font-body text-[8px] text-plum-muted">© 2026 Queuebuzz. All Rights Reserved</p>
          <p class="font-body text-[8px] text-plum-muted">
            Terms &amp; Conditions &nbsp;|&nbsp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Croppers — outside the scroll container so the modal portal works correctly -->
  <BaseImageCropper
    :is-open="cropperOpen === 'banner'"
    :image-src="cropperSrc"
    :aspect-ratio="16 / 6"
    title="Crop Banner Image"
    @close="closeCropper"
    @crop="onCrop"
  />
  <BaseImageCropper
    :is-open="cropperOpen === 'avatar'"
    :image-src="cropperSrc"
    :aspect-ratio="1"
    title="Crop Profile Photo"
    @close="closeCropper"
    @crop="onCrop"
  />
</template>

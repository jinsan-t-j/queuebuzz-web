<script setup lang="ts">
/**
 * @component JoinViewPreview
 * @description Interactive preview of the customer-facing JoinView.
 * Mirrors the layout of CustomerHeader + JoinQueueForm with real image
 * upload (via BaseImageCropper) and an inline-editable business name.
 *
 * Reusable: can be dropped into any context that needs a live brand preview.
 */
import { Clock, Upload, UserCircle2 } from 'lucide-vue-next'
import { defineAsyncComponent, ref } from 'vue'

const BaseImageCropper = defineAsyncComponent(
  () => import('@/components/base/BaseImageCropper.vue'),
)

const bannerPreview = ref<string | null>(null)
const avatarPreview = ref<string | null>(null)
const cropperOpen = ref<'banner' | 'avatar' | null>(null)
const cropperSrc = ref<string | null>(null)
const brandTitle = ref('Sakura Café')

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
    <!-- Blobs — mirrors JoinView decorations -->
    <div
      class="pointer-events-none absolute -right-10 -top-10 h-[160px] w-[160px] rounded-full bg-mint-light/70 blur-[40px] z-0"
    />
    <div
      class="pointer-events-none absolute -bottom-10 -left-16 h-[150px] w-[150px] rounded-[100px] bg-warning/35 blur-[40px] z-0"
    />

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

          <!-- Gradient overlay — always so text stays legible -->
          <div class="absolute inset-0 bg-gradient-to-t from-plum/60 via-plum/20 to-transparent" />

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
      <div class="flex flex-col gap-4 px-4 py-5">
        <!-- Stats card -->
        <div class="rounded-3xl border border-plum-faint bg-white p-4 text-center">
          <p class="font-body text-[9px] font-semibold uppercase tracking-[2.4px] text-plum-soft">
            People in Queue
          </p>
          <p class="font-display text-5xl font-normal leading-none text-plum mt-2">7</p>
          <div
            class="mx-auto mt-2 flex w-fit items-center gap-1.5 rounded-full border border-plum-faint/50 bg-sand px-3 py-1"
          >
            <Clock class="h-3 w-3 text-mint-dark" />
            <span class="font-mono text-xs font-bold text-plum">~12 min</span>
            <span class="font-body text-xs text-plum-soft">Wait</span>
          </div>
          <p class="mt-2 font-body text-[9px] leading-snug text-plum-muted">
            Your wait time is estimated,<br />it may slightly shift as the queue moves.
          </p>
        </div>

        <!-- Secure your spot -->
        <p class="font-body text-sm font-bold text-plum mt-1">Secure your spot</p>

        <!-- Name input -->
        <div class="flex items-start gap-3 rounded-3xl border border-plum-faint bg-white px-3 py-3">
          <div
            class="h-7 w-7 rounded-full bg-plum-faint flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <UserCircle2 class="h-3.5 w-3.5 text-plum-muted" />
          </div>
          <div>
            <p class="font-body text-xs text-plum-muted/40">What should we call you?</p>
            <p class="font-body text-[9px] text-plum-muted mt-0.5">Appears as Guest if skipped</p>
          </div>
        </div>

        <!-- Buzz me toggle -->
        <div
          class="flex items-center justify-between rounded-3xl border border-plum-faint bg-white px-3 py-2.5"
        >
          <div class="flex items-center gap-2">
            <div
              class="h-8 w-8 rounded-full bg-mint-light flex items-center justify-center flex-shrink-0"
            >
              <svg class="h-4 w-4 text-mint-dark" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C10.9 2 10 2.9 10 4V4.29C7.12 5.15 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.15 14 4.29V4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z"
                />
              </svg>
            </div>
            <div>
              <p class="font-body text-[11px] font-semibold text-plum leading-none">
                Buzz me when ready
              </p>
              <p class="font-body text-[9px] text-plum-muted mt-0.5">
                Get notified when it's your turn
              </p>
            </div>
          </div>
          <div class="relative w-9 h-5 rounded-full bg-mint flex-shrink-0">
            <span class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
          </div>
        </div>

        <!-- Add email for recovery row -->
        <div class="flex items-center gap-3 min-h-[40px] px-1">
          <svg
            class="h-3.5 w-3.5 text-plum-muted flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" />
          </svg>
          <span class="flex-1 font-body text-[11px] font-medium text-plum-muted"
            >Add email for recovery</span
          >
          <svg
            class="h-3 w-3 text-plum-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Join CTA -->
        <button
          class="w-full rounded-2xl bg-mint font-body text-sm font-semibold text-on-mint shadow-[0_8px_24px_rgba(0,229,160,0.50)] flex items-center justify-center gap-2 px-6 py-4"
        >
          Join the Queue
          <svg
            class="h-4 w-4 text-on-mint"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Already have a ticket -->
        <p class="text-center font-body text-[10px] text-plum-muted pt-1">
          Already have a ticket?
          <span class="underline underline-offset-2">Enter your join code</span>
        </p>

        <!-- Mini footer -->
        <div class="border-t border-plum-faint/50 pt-3 text-center space-y-1.5 pb-2">
          <p class="font-body text-[9px] text-plum-muted">© 2026 Queuebuzz. All Rights Reserved</p>
          <p class="font-body text-[9px] text-plum-muted">
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

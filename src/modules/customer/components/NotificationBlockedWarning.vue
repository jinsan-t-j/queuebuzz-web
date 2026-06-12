<script setup lang="ts">
/**
 * @component NotificationBlockedWarning
 * @description Dynamic, platform-aware instructional warning card for when notifications are denied/blocked in browser settings.
 */

defineProps({
  isIOS: { type: Boolean, default: false },
  isMac: { type: Boolean, default: false },
  isAndroid: { type: Boolean, default: false },
  isSafari: { type: Boolean, default: false },
})

const emit = defineEmits(['retrigger', 'buzz-off'])
</script>

<template>
  <div
    class="mt-4 rounded-3xl border border-danger/25 bg-[#FEF2F2] p-5 text-left transition-all animate-in fade-in slide-in-from-top-2"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <p class="font-body text-sm font-semibold text-plum">Notifications are blocked</p>
        <p class="font-body text-xs text-plum-muted mt-0.5">
          Your browser is blocking notifications. We cannot buzz you when your turn arrives.
        </p>
      </div>
    </div>

    <!-- Step-by-step instructions based on OS -->
    <div class="mt-4 border-t border-danger/10 pt-4">
      <p class="font-body text-xs font-semibold text-plum uppercase tracking-wider">
        How to enable:
      </p>

      <!-- iOS Instructions -->
      <ol v-if="isIOS" class="mt-2 list-decimal pl-4 font-body text-xs text-plum-soft space-y-1.5">
        <li>
          Ensure this app is added to your Home Screen (tap Safari's <strong>Share</strong> button,
          then <strong>Add to Home Screen</strong>).
        </li>
        <li>Launch the installed app from your Home Screen.</li>
        <li>
          If still blocked: Open iPhone <strong>Settings</strong> &gt;
          <strong>Notifications</strong> &gt; <strong>QueueBuzz</strong> and set to
          <strong>Allow Notifications</strong>.
        </li>
      </ol>

      <!-- MacOS/Safari Instructions -->
      <ol
        v-else-if="isMac && isSafari"
        class="mt-2 list-decimal pl-4 font-body text-xs text-plum-soft space-y-1.5"
      >
        <li>
          In Safari's top menu bar, select <strong>Safari</strong> &gt;
          <strong>Settings for This Website...</strong>
        </li>
        <li>Change the <strong>Notifications</strong> dropdown to <strong>Allow</strong>.</li>
        <li>
          Alternatively, go to Safari <strong>Settings</strong> &gt; <strong>Websites</strong> &gt;
          <strong>Notifications</strong>, find QueueBuzz, and change to <strong>Allow</strong>.
        </li>
      </ol>

      <!-- Android Instructions -->
      <ol
        v-else-if="isAndroid"
        class="mt-2 list-decimal pl-4 font-body text-xs text-plum-soft space-y-1.5"
      >
        <li>
          Tap the <strong>Lock 🔒</strong> or site settings icon next to the URL in your browser
          address bar.
        </li>
        <li>Tap <strong>Permissions</strong> or <strong>Site settings</strong>.</li>
        <li>Change <strong>Notifications</strong> to <strong>Allow</strong>.</li>
      </ol>

      <!-- Generic / Desktop Chrome/Firefox/Edge Instructions -->
      <ol v-else class="mt-2 list-decimal pl-4 font-body text-xs text-plum-soft space-y-1.5">
        <li>
          Click the <strong>Lock 🔒</strong> or settings icon next to the URL in your browser's
          address bar.
        </li>
        <li>
          Toggle <strong>Notifications</strong> to <strong>Allow</strong> (or click
          <strong>Site settings</strong> and allow them).
        </li>
      </ol>
    </div>

    <div class="mt-4 flex gap-3">
      <button
        type="button"
        class="flex-1 rounded-xl bg-white border border-danger/25 px-4 py-2 font-body text-xs font-semibold text-danger hover:bg-danger/5 transition-colors cursor-pointer text-center"
        @click="emit('retrigger')"
      >
        Try Enabling Now
      </button>
      <button
        type="button"
        class="rounded-xl bg-transparent border border-plum-faint px-3 py-2 font-body text-xs font-semibold text-plum-muted hover:text-plum hover:bg-sand transition-colors cursor-pointer text-center"
        @click="emit('buzz-off')"
      >
        Buzz off
      </button>
    </div>
  </div>
</template>

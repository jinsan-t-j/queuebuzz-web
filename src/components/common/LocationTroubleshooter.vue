<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

defineProps({
  geoError: {
    type: String,
    default: null,
  },
  accuracy: {
    type: Number,
    default: null,
  },
})

const isTroubleshootingOpen = ref(false)
const activeOsTab = ref('mac')

onMounted(() => {
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('android')) {
      activeOsTab.value = 'android'
    } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      activeOsTab.value = 'iphone'
    } else if (ua.includes('windows')) {
      activeOsTab.value = 'windows'
    } else {
      activeOsTab.value = 'mac'
    }
  }
})
</script>

<template>
  <div class="w-full text-left">
    <!-- Error Message Alert -->
    <div
      v-if="geoError"
      class="mb-4 p-4 bg-danger/5 rounded-2xl border border-danger/25 text-left flex items-start gap-3"
    >
      <Info class="w-4 h-4 shrink-0 text-danger mt-0.5" />
      <p class="font-body text-xs text-danger leading-relaxed">
        {{ geoError }}
      </p>
    </div>

    <!-- Low Accuracy Warning -->
    <div
      v-if="accuracy && accuracy > 150"
      class="mb-4 p-4 bg-warning/5 rounded-2xl border border-warning/20 text-left flex items-start gap-3"
    >
      <Info class="w-4 h-4 shrink-0 text-warning mt-0.5" />
      <div>
        <p class="font-body text-xs font-semibold text-plum uppercase tracking-wider">
          Low Accuracy Detected (~{{ Math.round(accuracy) }}m)
        </p>
        <p class="font-body text-xs text-plum-soft mt-0.5 leading-relaxed">
          Your location is imprecise. Please ensure your device GPS is turned <strong>ON</strong> in
          system settings and any <strong>VPN</strong> is turned off.
        </p>
      </div>
    </div>

    <!-- Collapsible Troubleshooting Guide -->
    <div
      v-if="geoError || (accuracy && accuracy > 150)"
      class="mb-4 rounded-2xl border border-plum-faint overflow-hidden bg-plum-faint/10"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between px-4 py-3 bg-white font-body text-xs font-semibold text-plum hover:bg-sand/30 transition-colors"
        @click="isTroubleshootingOpen = !isTroubleshootingOpen"
      >
        <span class="flex items-center gap-1.5">
          <svg
            class="w-4 h-4 text-plum-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Location Troubleshooting Guide
        </span>
        <svg
          :class="[
            'w-3.5 h-3.5 text-plum-muted transition-transform duration-200',
            isTroubleshootingOpen ? 'rotate-180' : '',
          ]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div v-show="isTroubleshootingOpen" class="p-4 border-t border-plum-faint text-left bg-white">
        <!-- OS Tabs Selector -->
        <div class="flex border-b border-plum-faint mb-3 overflow-x-auto gap-1 pb-1">
          <button
            v-for="os in ['Mac', 'iPhone', 'Android', 'Windows']"
            :key="os"
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all whitespace-nowrap',
              activeOsTab === os.toLowerCase()
                ? 'bg-plum text-sand font-semibold'
                : 'text-plum-muted hover:text-plum hover:bg-plum-faint',
            ]"
            @click="activeOsTab = os.toLowerCase()"
          >
            {{ os }}
          </button>
        </div>

        <!-- Instructions depending on tab -->
        <div class="font-body text-xs text-plum-soft leading-relaxed">
          <div v-if="activeOsTab === 'mac'" class="space-y-1.5 animate-in fade-in duration-200">
            <p>
              1. Open system
              <strong>System Settings ➔ Privacy & Security ➔ Location Services</strong>.
            </p>
            <p>2. Ensure <strong>Location Services</strong> toggle is ON.</p>
            <p>
              3. Toggle ON location permissions for your browser (e.g. Chrome/Safari) in the list.
            </p>
            <p>4. Disable any active <strong>VPNs</strong> and restart your browser.</p>
          </div>
          <div
            v-else-if="activeOsTab === 'iphone'"
            class="space-y-1.5 animate-in fade-in duration-200"
          >
            <p>1. Open iOS <strong>Settings ➔ Privacy & Security ➔ Location Services</strong>.</p>
            <p>2. Make sure <strong>Location Services</strong> is enabled.</p>
            <p>
              3. Tap your browser in the list and select <strong>"While Using the App"</strong>.
            </p>
            <p>4. Make sure <strong>"Precise Location"</strong> is toggled ON.</p>
          </div>
          <div
            v-else-if="activeOsTab === 'android'"
            class="space-y-1.5 animate-in fade-in duration-200"
          >
            <p>
              1. Pull down the notifications shade and toggle ON <strong>Location / GPS</strong>.
            </p>
            <p>2. Go to <strong>Settings ➔ Apps ➔ Chrome (or browser) ➔ Permissions</strong>.</p>
            <p>
              3. Ensure <strong>Location</strong> permission is set to
              <strong>"Allow while using app"</strong>.
            </p>
            <p>4. Toggle ON <strong>"Use precise location"</strong>.</p>
          </div>
          <div
            v-else-if="activeOsTab === 'windows'"
            class="space-y-1.5 animate-in fade-in duration-200"
          >
            <p>1. Open <strong>Settings ➔ Privacy & security ➔ Location</strong>.</p>
            <p>
              2. Turn ON <strong>Location services</strong> and
              <strong>Let apps access your location</strong>.
            </p>
            <p>3. Toggle ON access for your browser in the desktop apps section.</p>
            <p>4. Disable any active <strong>VPNs</strong> and restart your browser.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

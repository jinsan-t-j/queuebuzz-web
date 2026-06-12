<script setup lang="ts">
/**
 * @component LocationTroubleshooter
 * @description Geolocation helper displaying device-specific troubleshooting
 * guidance, accuracy warnings, and integrated retry operations.
 */
import { Info, RefreshCw } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    geoError?: string | null
    accuracy?: number | null
    isLocating?: boolean
  }>(),
  {
    geoError: null,
    accuracy: null,
    isLocating: false,
  },
)

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const isTroubleshootingOpen = ref(false)
const detectedOs = ref<'mac' | 'iphone' | 'android' | 'windows' | 'generic'>('generic')
const detectedBrowser = ref<string>('Browser')

onMounted(() => {
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase()

    // Detect OS
    if (ua.includes('android')) {
      detectedOs.value = 'android'
    } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      detectedOs.value = 'iphone'
    } else if (ua.includes('windows')) {
      detectedOs.value = 'windows'
    } else if (ua.includes('mac') || ua.includes('os x')) {
      detectedOs.value = 'mac'
    } else {
      detectedOs.value = 'generic'
    }

    // Detect Browser
    if (ua.includes('firefox')) {
      detectedBrowser.value = 'Firefox'
    } else if (ua.includes('edg')) {
      detectedBrowser.value = 'Edge'
    } else if (ua.includes('opr') || ua.includes('opera')) {
      detectedBrowser.value = 'Opera'
    } else if (ua.includes('chrome') && !ua.includes('chromium')) {
      detectedBrowser.value = 'Chrome'
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      detectedBrowser.value = 'Safari'
    } else if (ua.includes('brave')) {
      detectedBrowser.value = 'Brave'
    } else {
      detectedBrowser.value = 'Browser'
    }
  }
})

// Classify error type to show only relevant instructions
const errorType = computed<'permission' | 'hardware' | 'generic'>(() => {
  if (!props.geoError) {
    if (props.accuracy && props.accuracy > 150) {
      return 'hardware'
    }
    return 'generic'
  }
  const err = props.geoError.toLowerCase()
  if (err.includes('denied') || err.includes('permission')) {
    return 'permission'
  }
  if (err.includes('unavailable') || err.includes('timeout')) {
    return 'hardware'
  }
  return 'generic'
})

const displayOsName = computed(() => {
  switch (detectedOs.value) {
    case 'mac':
      return 'macOS'
    case 'iphone':
      return 'iOS'
    case 'android':
      return 'Android'
    case 'windows':
      return 'Windows'
    default:
      return 'System'
  }
})
</script>

<template>
  <div class="w-full text-left">
    <!-- Error Message Alert with Integrated Retry -->
    <div
      v-if="geoError"
      class="mb-4 p-4 bg-danger/5 rounded-2xl border border-danger/25 text-left flex flex-col gap-3"
    >
      <div class="flex items-start gap-3">
        <Info class="w-4.5 h-4.5 shrink-0 text-danger mt-0.5" />
        <div class="flex-1">
          <p class="font-body text-xs font-semibold text-danger mb-0.5">Location Access Blocked</p>
          <p class="font-body text-xs text-danger/80 leading-relaxed">
            {{ geoError }}
          </p>
        </div>
      </div>
      <div class="flex justify-end border-t border-danger/10 pt-2.5">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-danger text-white hover:bg-danger/90 transition-all font-body text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLocating"
          @click="emit('retry')"
        >
          <RefreshCw :class="['w-3 h-3 text-white', isLocating ? 'animate-spin' : '']" />
          {{ isLocating ? 'Retrying...' : 'Retry Location' }}
        </button>
      </div>
    </div>

    <!-- Low Accuracy Warning with Integrated Retry -->
    <div
      v-if="accuracy && accuracy > 150"
      class="mb-4 p-4 bg-warning/5 rounded-2xl border border-warning/20 text-left flex flex-col gap-3"
    >
      <div class="flex items-start gap-3">
        <Info class="w-4.5 h-4.5 shrink-0 text-warning mt-0.5" />
        <div class="flex-1">
          <p class="font-body text-xs font-semibold text-plum uppercase tracking-wider">
            Low Accuracy Detected (~{{ Math.round(accuracy) }}m)
          </p>
          <p class="font-body text-xs text-plum-soft mt-0.5 leading-relaxed">
            Your location is imprecise. Please ensure your device GPS is turned
            <strong>ON</strong> in system settings and any active <strong>VPN</strong> is turned
            off.
          </p>
        </div>
      </div>
      <div class="flex justify-end border-t border-warning/10 pt-2.5">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-plum text-sand hover:bg-plum-soft transition-all font-body text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLocating"
          @click="emit('retry')"
        >
          <RefreshCw :class="['w-3 h-3 text-sand', isLocating ? 'animate-spin' : '']" />
          {{ isLocating ? 'Retrying...' : 'Retry Capture' }}
        </button>
      </div>
    </div>

    <!-- Collapsible Troubleshooting Guide -->
    <div
      v-if="geoError || (accuracy && accuracy > 150)"
      class="mb-4 rounded-2xl border border-plum-faint overflow-hidden bg-plum-faint/10"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between px-4 py-3 bg-white font-body text-xs font-semibold text-plum hover:bg-sand/30 transition-colors cursor-pointer"
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
        <!-- Detection status bar -->
        <div class="flex items-center justify-between border-b border-plum-faint pb-3 mb-3">
          <div class="flex flex-col">
            <span class="font-body text-[10px] text-plum-muted uppercase font-bold tracking-wider"
              >Platform Detected</span
            >
            <span class="font-body text-xs font-semibold text-plum"
              >{{ displayOsName }} • {{ detectedBrowser }}</span
            >
          </div>
          <span
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-mint-light text-plum font-body text-[10px] font-bold"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            {{ errorType === 'permission' ? 'Permission Guide' : 'Accuracy Guide' }}
          </span>
        </div>

        <!-- Dynamic tailormade instructions based on error context -->
        <div class="font-body text-xs text-plum-soft leading-relaxed">
          <!-- DUAL PERMISSION FLOW (OS vs BROWSER SPLIT) -->
          <template v-if="errorType === 'permission'">
            <div class="space-y-4">
              <!-- Block 1: Browser Settings (Most Common) -->
              <div class="p-3.5 bg-mint-light/35 border border-mint/20 rounded-2xl space-y-2">
                <p class="font-body text-xs font-semibold text-plum flex items-center gap-1.5">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  1. Browser Permission (Quickest Fix)
                </p>
                <div class="pl-3 font-body text-xs text-plum-soft space-y-2">
                  <!-- macOS Safari -->
                  <p v-if="detectedOs === 'mac' && detectedBrowser === 'Safari'">
                    ➔ Go to <strong>Safari ➔ Settings ➔ Websites ➔ Location</strong> in the top menu
                    bar, locate this website in the list, and change the setting to
                    <strong>Allow</strong>.
                  </p>
                  <!-- Firefox (All Desktop OS) -->
                  <p
                    v-else-if="
                      detectedBrowser === 'Firefox' &&
                      (detectedOs === 'mac' || detectedOs === 'windows')
                    "
                  >
                    ➔ Click the <strong>permissions block/lock icon</strong> to the left of the URL
                    in the address bar, clear any "Blocked" status, and reload the page.
                  </p>
                  <!-- iOS Chrome / Firefox / Edge -->
                  <p v-else-if="detectedOs === 'iphone' && detectedBrowser !== 'Safari'">
                    ➔ Open iOS <strong>Settings ➔ {{ detectedBrowser }}</strong
                    >, select <strong>Location</strong>, and set it to
                    <strong>"While Using the App"</strong>.
                  </p>
                  <!-- Android Chrome -->
                  <p v-else-if="detectedOs === 'android' && detectedBrowser === 'Chrome'">
                    ➔ Tap the
                    <strong>three dots menu ➔ Settings ➔ Site Settings ➔ Location</strong>, find
                    this site in the list, and make sure it is set to **Allow**. (Or tap the URL
                    lock icon, go to Permissions, and toggle Location ON).
                  </p>
                  <!-- Android Firefox -->
                  <p v-else-if="detectedOs === 'android' && detectedBrowser === 'Firefox'">
                    ➔ Tap the
                    <strong>three dots menu ➔ Settings ➔ Site permissions ➔ Location</strong>, and
                    select **Allowed**.
                  </p>
                  <!-- Desktop Chrome / Brave / Edge (macOS & Windows) -->
                  <p v-else-if="detectedOs === 'mac' || detectedOs === 'windows'">
                    ➔ Click the <strong>lock icon (🔒 or 🎛️)</strong> directly next to the website
                    URL in the address bar, and change the **Location** toggle to
                    <strong>Allow</strong>.
                  </p>
                  <!-- Generic Fallback -->
                  <p v-else>
                    ➔ Look at your browser's address bar next to the URL, tap the **lock / settings
                    icon**, and allow location permissions for this website.
                  </p>
                </div>
              </div>

              <!-- Block 2: Operating System Settings -->
              <div class="p-3.5 bg-plum-faint/30 border border-plum-faint rounded-2xl space-y-2">
                <p class="font-body text-xs font-semibold text-plum flex items-center gap-1.5">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-plum-muted" />
                  2. Device / OS Settings (If browser fix didn't work)
                </p>
                <div class="pl-3 font-body text-xs text-plum-soft space-y-2">
                  <!-- macOS System settings -->
                  <div v-if="detectedOs === 'mac'" class="space-y-1">
                    <p>
                      ➔ Go to Apple Menu ➔
                      <strong>System Settings ➔ Privacy & Security ➔ Location Services</strong>.
                    </p>
                    <p>➔ Ensure global <strong>Location Services</strong> toggle is ON.</p>
                    <p>
                      ➔ Scroll down and make sure <strong>{{ detectedBrowser }}</strong> is toggled
                      ON in the list.
                    </p>
                    <p>
                      ➔
                      <em
                        >Note: If Location Services and {{ detectedBrowser }} are already ON but
                        fetching still fails, try toggling both OFF, waiting 5 seconds, toggling
                        them back ON, and restarting your browser.</em
                      >
                    </p>
                  </div>
                  <!-- iOS settings -->
                  <div v-else-if="detectedOs === 'iphone'" class="space-y-1">
                    <p>
                      ➔ Open iOS <strong>Settings ➔ Privacy & Security ➔ Location Services</strong>.
                    </p>
                    <p>➔ Ensure <strong>Location Services</strong> is switched ON.</p>
                    <p>
                      ➔ Tap <strong>Safari</strong> in the settings app list, select
                      <strong>Location</strong>, and choose **"While Using the App"**.
                    </p>
                  </div>
                  <!-- Android settings -->
                  <div v-else-if="detectedOs === 'android'" class="space-y-1">
                    <p>
                      ➔ Go to device
                      <strong
                        >Settings ➔ Apps ➔ {{ detectedBrowser }} ➔ Permissions ➔ Location</strong
                      >.
                    </p>
                    <p>
                      ➔ Confirm that it is set to <strong>"Allow only while using the app"</strong>.
                    </p>
                    <p>➔ Enable the <strong>"Use precise location"</strong> toggle.</p>
                  </div>
                  <!-- Windows settings -->
                  <div v-else-if="detectedOs === 'windows'" class="space-y-1">
                    <p>➔ Open <strong>Settings ➔ Privacy & security ➔ Location</strong>.</p>
                    <p>
                      ➔ Turn ON <strong>Location services</strong> and **"Let apps access your
                      location"**.
                    </p>
                    <p>
                      ➔ Verify access is toggled ON for <strong>{{ detectedBrowser }}</strong> in
                      the desktop apps list below.
                    </p>
                  </div>
                  <!-- Generic OS settings -->
                  <div v-else class="space-y-1">
                    <p>
                      ➔ Open your device settings and locate
                      <strong>Location / GPS Services</strong>.
                    </p>
                    <p>
                      ➔ Enable location access and grant permission to
                      <strong>{{ detectedBrowser }}</strong
                      >.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ACCURACY / HARDWARE FLOW -->
          <template v-else>
            <!-- macOS -->
            <div v-if="detectedOs === 'mac'" class="space-y-2 animate-in fade-in duration-200">
              <p>1. Ensure your computer is connected to a stable WiFi network or Ethernet.</p>
              <p>2. Disable any active <strong>VPN</strong> or proxy server in settings/app.</p>
              <p>
                3. If using a laptop, ensure the lid is open (macOS triangulates coordinates using
                nearby WiFi routers).
              </p>
              <p>
                4. If location services are enabled but coordinate fetching still fails, toggle
                <strong>Location Services</strong> OFF and ON in macOS System Settings, then restart
                your browser.
              </p>
            </div>
            <!-- iOS -->
            <div
              v-else-if="detectedOs === 'iphone'"
              class="space-y-2 animate-in fade-in duration-200"
            >
              <p>1. Open Control Center and verify cellular data or WiFi is active.</p>
              <p>
                2. Go to iOS Settings and make sure you do not have any active **VPN** connected.
              </p>
              <p>3. If indoors, step closer to a window to help your phone establish a GPS lock.</p>
            </div>
            <!-- Android -->
            <div
              v-else-if="detectedOs === 'android'"
              class="space-y-2 animate-in fade-in duration-200"
            >
              <p>1. Drag down the notification shade and ensure **Location / GPS** is turned ON.</p>
              <p>2. Open system Settings and disable any active **VPN** or proxy apps.</p>
              <p>3. Tap Location ➔ Location Services ➔ Enable **Google Location Accuracy**.</p>
            </div>
            <!-- Windows -->
            <div
              v-else-if="detectedOs === 'windows'"
              class="space-y-2 animate-in fade-in duration-200"
            >
              <p>
                1. Ensure your PC is connected to a WiFi network (improves triangulation accuracy).
              </p>
              <p>2. Deactivate any active **VPN** or network proxy connections.</p>
              <p>3. Restart your browser to flush cached positioning sensors.</p>
            </div>
            <!-- Generic -->
            <div v-else class="space-y-2 animate-in fade-in duration-200">
              <p>1. Verify your device GPS or Location Services is toggled ON.</p>
              <p>2. Disconnect any active VPN profiles.</p>
            </div>
          </template>
        </div>

        <!-- Integrated bottom retry action inside the guide -->
        <div class="mt-4 pt-3.5 border-t border-plum-faint flex items-center justify-between">
          <div class="flex flex-col">
            <span class="font-body text-[10px] text-plum-muted uppercase font-bold tracking-wider"
              >Troubleshooting Done?</span
            >
            <span class="font-body text-[11px] text-plum-soft">Refresh location to test.</span>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-mint text-plum font-body text-xs font-bold hover:bg-mint/90 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLocating"
            @click="emit('retry')"
          >
            <RefreshCw :class="['w-3.5 h-3.5 text-plum', isLocating ? 'animate-spin' : '']" />
            {{ isLocating ? 'Retrying...' : 'Test Location' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component HomeVideoDemoSection
 * @description Lightweight YouTube facade component. Loads thumbnail first;
 * mounts YouTube iframe only when clicked or chapter selected.
 */
import { Play } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    youtubeId?: string
    youtubeUrl?: string
    isEmbedded?: boolean
  }>(),
  {
    id: 'demo-video',
    youtubeId: 'BaNQZgFbSS4',
    youtubeUrl: 'https://youtu.be/BaNQZgFbSS4',
    isEmbedded: false,
  },
)

const isLoaded = ref(false)
const activeStartTime = ref(0)

const parsedYoutubeId = computed(() => {
  if (props.youtubeUrl) {
    const match = props.youtubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^#&?]*)/,
    )
    if (match && match[1]) return match[1]
  }
  return props.youtubeId || 'BaNQZgFbSS4'
})

function playVideo(startTime = 0) {
  activeStartTime.value = startTime
  isLoaded.value = true
}
</script>

<template>
  <div :id="id" class="w-full">
    <!-- Video Player / Facade Frame (16:9 Aspect Ratio) -->
    <div
      class="relative w-full aspect-video bg-[#1A0A2E] rounded-2xl sm:rounded-3xl border border-plum-faint/30 shadow-xl overflow-hidden group"
    >
      <!-- YouTube Embed Iframe (ONLY mounted on user interaction) -->
      <iframe
        v-if="isLoaded"
        class="w-full h-full border-0"
        :src="`https://www.youtube-nocookie.com/embed/${parsedYoutubeId}?autoplay=1&rel=0&modestbranding=1&start=${activeStartTime}`"
        title="QueueBuzz Product Demo Video"
        loading="lazy"
        allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
          web-share;
        "
        allowfullscreen
      />

      <!-- Facade Poster Overlay (Before user clicks play) -->
      <div
        v-else
        class="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 cursor-pointer z-10 select-none overflow-hidden"
        @click="playVideo(0)"
      >
        <!-- YouTube Thumbnail Poster Image -->
        <img
          :src="`https://img.youtube.com/vi/${parsedYoutubeId}/maxresdefault.jpg`"
          alt="QueueBuzz Product Demo Thumbnail"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
        />

        <div
          class="absolute inset-0 bg-gradient-to-t from-[#1A0A2E] via-[#1A0A2E]/40 to-transparent pointer-events-none"
        />
        <!-- Central Play CTA Button -->
        <div class="relative z-10 self-center flex flex-col items-center gap-3 my-auto text-center">
          <button
            type="button"
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-mint flex items-center justify-center text-plum shadow-lg group-hover:scale-110 transition-transform duration-200 cursor-pointer"
            aria-label="Play Product Demo Video"
          >
            <Play class="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
          </button>
          <div>
            <p class="font-display font-bold text-white text-base sm:text-lg">
              See QueueBuzz in action
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

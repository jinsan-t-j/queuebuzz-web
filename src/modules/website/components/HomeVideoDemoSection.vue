<script setup lang="ts">
/**
 * @component HomeVideoDemoSection
 * @description Plain YouTube embed for the marketing demo video. Play/pause, mute,
 * captions, quality, and fullscreen are all native YouTube controls — no custom
 * IFrame Player API wiring to maintain.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    youtubeId?: string
    youtubeUrl?: string
    isEmbedded?: boolean
    autoplay?: boolean
  }>(),
  {
    id: 'demo-video',
    youtubeId: 'BaNQZgFbSS4',
    youtubeUrl: 'https://youtu.be/BaNQZgFbSS4',
    isEmbedded: false,
    autoplay: true,
  },
)

const parsedYoutubeId = computed(() => {
  if (props.youtubeUrl) {
    const match = props.youtubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^#&?]*)/,
    )
    if (match && match[1]) return match[1]
  }
  return props.youtubeId || 'BaNQZgFbSS4'
})

const embedUrl = computed(() => {
  const params = new URLSearchParams({
    autoplay: props.autoplay ? '1' : '0',
    mute: props.autoplay ? '1' : '0',
    controls: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    cc_load_policy: '0',
  })
  return `https://www.youtube-nocookie.com/embed/${parsedYoutubeId.value}?${params.toString()}?cc_load_policy=0&rel=0`
})
</script>

<template>
  <div :id="id" class="w-full">
    <div
      class="relative w-full aspect-video overflow-hidden rounded-3xl bg-plum shadow-[0_8px_30px_rgba(26,10,46,0.08)]"
    >
      <iframe
        class="absolute inset-0 h-full w-full"
        :src="embedUrl"
        title="QueueBuzz Product Demo"
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
    </div>
  </div>
</template>

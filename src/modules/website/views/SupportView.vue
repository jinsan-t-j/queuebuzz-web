<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Mail, MessageSquare, ShieldCheck, Sparkles, Send } from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const isSubmitting = ref(false)
const isSuccess = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))
  isSubmitting.value = false
  isSuccess.value = true
  formData.value = { name: '', email: '', subject: '', message: '' }
  setTimeout(() => {
    isSuccess.value = false
  }, 5000)
}

const scrollY = ref(0)
const handleScroll = () => {
  scrollY.value = globalThis.scrollY
}

onMounted(() => {
  globalThis.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => {
  globalThis.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-sand pb-24">
    <!-- Global Atmospheric Splashes -->
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        class="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[140px] animate-blob transition-transform duration-1000 ease-out"
        :style="{ transform: `translateY(${scrollY * 0.04}px)` }"
      />
      <div
        class="absolute bottom-[-5%] right-[-5%] w-[800px] h-[800px] bg-mint/5 rounded-full blur-[140px] animate-blob animation-delay-2000 transition-transform duration-1000 ease-out"
        :style="{ transform: `translateY(${scrollY * -0.06}px)` }"
      />
    </div>

    <!-- Hero Section -->
    <section class="relative z-10 px-6 pt-24 pb-16 lg:pt-32 lg:pb-24 text-center">
      <div class="mx-auto max-w-4xl">
        <BaseBadge class="mb-6">CONTACT & SUPPORT</BaseBadge>
        <h1
          class="font-display text-5xl font-black text-plum md:text-7xl tracking-tight leading-none mb-8"
        >
          How can we <span class="text-mint-dark">help?</span>
        </h1>
        <p
          class="mx-auto max-w-2xl font-body text-lg md:text-xl text-plum-soft leading-relaxed opacity-80"
        >
          Have a question about QueueBuzz, need help with your account, or want to report an issue?
          Send us a message and we'll get back to you shortly.
        </p>
      </div>
    </section>

    <!-- Content Area: Contact Form -->
    <section class="relative z-10 mx-auto max-w-3xl px-6">
      <BaseCard
        class="p-8 md:p-12 bg-white/40 backdrop-blur-3xl border-plum/5 shadow-[0_40px_80px_rgba(26,10,46,0.1)] rounded-[48px] overflow-hidden group"
      >
        <div class="flex items-center gap-3 mb-12">
          <div class="h-12 w-12 rounded-2xl bg-mint-light flex items-center justify-center">
            <MessageSquare class="h-6 w-6 text-mint-dark" />
          </div>
          <h2 class="font-display text-3xl font-bold text-plum">Send a Message</h2>
        </div>

        <form class="space-y-8" @submit.prevent="handleSubmit">
          <div class="grid gap-8 md:grid-cols-2">
            <div class="space-y-2">
              <label
                for="name"
                class="font-body text-xs font-black uppercase tracking-widest text-plum/40 ml-1"
                >Your Name</label
              >
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="w-full h-14 bg-white/60 border border-plum/5 rounded-2xl px-6 font-body text-plum placeholder:text-plum-muted/40 outline-none focus:border-mint focus:bg-white transition-all shadow-sm"
                placeholder="John Doe"
              />
            </div>

            <div class="space-y-2">
              <label
                for="email"
                class="font-body text-xs font-black uppercase tracking-widest text-plum/40 ml-1"
                >Email Address</label
              >
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="w-full h-14 bg-white/60 border border-plum/5 rounded-2xl px-6 font-body text-plum placeholder:text-plum-muted/40 outline-none focus:border-mint focus:bg-white transition-all shadow-sm"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label
              for="subject"
              class="font-body text-xs font-black uppercase tracking-widest text-plum/40 ml-1"
              >Subject</label
            >
            <input
              id="subject"
              v-model="formData.subject"
              type="text"
              required
              class="w-full h-14 bg-white/60 border border-plum/5 rounded-2xl px-6 font-body text-plum placeholder:text-plum-muted/40 outline-none focus:border-mint focus:bg-white transition-all shadow-sm"
              placeholder="How can we help you today?"
            />
          </div>

          <div class="space-y-2">
            <label
              for="message"
              class="font-body text-xs font-black uppercase tracking-widest text-plum/40 ml-1"
              >Message</label
            >
            <textarea
              id="message"
              v-model="formData.message"
              required
              rows="5"
              class="w-full bg-white/60 border border-plum/5 rounded-[32px] p-6 font-body text-plum placeholder:text-plum-muted/40 outline-none focus:border-mint focus:bg-white transition-all shadow-sm resize-none"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <div class="pt-4">
            <BaseButton
              type="submit"
              :disabled="isSubmitting"
              class="w-full h-16 text-lg font-bold shadow-xl shadow-mint/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Send v-if="!isSubmitting" class="h-5 w-5" />
              <span v-if="isSubmitting" class="animate-pulse">Sending message...</span>
              <span v-else>Send Message</span>
            </BaseButton>
          </div>

          <Transition
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <div
              v-if="isSuccess"
              class="p-6 rounded-3xl bg-mint-light/50 border border-mint text-plum font-body text-sm text-center flex items-center justify-center gap-3"
            >
              <Sparkles class="h-5 w-5 text-mint-dark" />
              <span>Thanks for reaching out! We'll get back to you shortly.</span>
            </div>
          </Transition>
        </form>
      </BaseCard>

      <!-- Direct Contact Info -->
      <div class="mt-20 grid gap-8 sm:grid-cols-2">
        <div
          class="p-8 bg-white/40 backdrop-blur-xl border border-plum/5 rounded-[32px] text-center group hover:bg-white transition-all"
        >
          <Mail class="h-8 w-8 text-plum/20 group-hover:text-mint transition-colors mx-auto mb-4" />
          <p class="font-body text-xs font-black uppercase tracking-widest text-plum/40 mb-2">
            Direct Email
          </p>
          <p class="font-display font-bold text-plum">support@queuebuzz.com</p>
        </div>
        <div
          class="p-8 bg-white/40 backdrop-blur-xl border border-plum/5 rounded-[32px] text-center group hover:bg-white transition-all"
        >
          <ShieldCheck
            class="h-8 w-8 text-plum/20 group-hover:text-mint transition-colors mx-auto mb-4"
          />
          <p class="font-body text-xs font-black uppercase tracking-widest text-plum/40 mb-2">
            Security
          </p>
          <p class="font-display font-bold text-plum">security@queuebuzz.com</p>
        </div>
      </div>
    </section>
  </div>
</template>

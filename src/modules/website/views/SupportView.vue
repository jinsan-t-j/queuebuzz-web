<script setup>
import { ref } from 'vue'

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

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  isSubmitting.value = false
  isSuccess.value = true

  formData.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }

  setTimeout(() => {
    isSuccess.value = false
  }, 5000)
}
</script>

<template>
  <div class="support-page pb-20">
    <!-- Hero Section -->
    <section class="bg-mint-light/30 px-5 pt-16 pb-16 md:px-0 md:pt-24 md:pb-24 text-center">
      <div class="mx-auto max-w-[720px]">
        <h1
          class="font-display font-bold text-plum text-[36px] md:text-[56px] tracking-[-0.02em] leading-tight mb-4"
        >
          How can we help?
        </h1>
        <p class="font-body text-plum-muted text-[16px] md:text-[18px] max-w-[540px] mx-auto">
          Have a question about QueueBuzz, need help with your account, or want to report an issue?
          Send us a message and we'll get back to you shortly.
        </p>
      </div>
    </section>

    <!-- Content Area: Contact Form -->
    <section class="mx-auto max-w-[640px] px-5 pt-12 md:px-0 md:pt-16">
      <div class="bg-white rounded-2xl shadow-sm border border-plum-faint p-6 md:p-10">
        <h2 class="font-display font-bold text-[24px] text-plum mb-6 md:mb-8 text-center">
          Contact Us
        </h2>

        <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
          <div class="flex flex-col md:flex-row gap-5">
            <div class="flex-1 flex flex-col gap-1.5">
              <label for="name" class="font-body text-[13px] font-medium text-plum">Name</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                class="w-full rounded-lg border border-plum-faint px-4 py-2.5 font-body text-[14px] text-plum outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div class="flex-1 flex flex-col gap-1.5">
              <label for="email" class="font-body text-[13px] font-medium text-plum"
                >Email Address</label
              >
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="w-full rounded-lg border border-plum-faint px-4 py-2.5 font-body text-[14px] text-plum outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="subject" class="font-body text-[13px] font-medium text-plum">Subject</label>
            <input
              id="subject"
              v-model="formData.subject"
              type="text"
              required
              class="w-full rounded-lg border border-plum-faint px-4 py-2.5 font-body text-[14px] text-plum outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors"
              placeholder="How can we help you?"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="message" class="font-body text-[13px] font-medium text-plum">Message</label>
            <textarea
              id="message"
              v-model="formData.message"
              required
              rows="5"
              class="w-full rounded-lg border border-plum-faint px-4 py-3 font-body text-[14px] text-plum outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors resize-y"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="mt-2 w-full rounded-pill bg-mint px-6 py-3.5 font-body text-[15px] font-bold text-plum transition-colors hover:bg-mint-dark disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            <span v-if="isSubmitting">Sending message...</span>
            <span v-else>Send Message</span>
          </button>

          <div
            v-if="isSuccess"
            class="mt-4 p-4 rounded-lg bg-mint-light text-mint-dark font-body text-sm text-center border border-mint"
          >
            Thanks for reaching out! We've received your message and will get back to you soon.
          </div>
        </form>
      </div>

      <!-- Direct Contact Info -->
      <div class="mt-12 text-center text-plum-muted font-body text-[14px]">
        <p>Prefer to email us directly?</p>
        <p class="mt-1 font-medium text-plum">support@queuebuzz.com</p>
      </div>
    </section>
  </div>
</template>

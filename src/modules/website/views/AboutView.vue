<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue'
import { Heart, MapPin, Smartphone, Zap } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'
import { useSchemaOrg } from '@/composables/useSchemaOrg'
import seoConfig from '@/config/seo.constants.json'

useSeoMeta(seoConfig['/about'])

const { injectAboutSchema } = useSchemaOrg()
injectAboutSchema()

const values = [
  {
    icon: Zap,
    title: 'Zero friction',
    description:
      'No app downloads, no accounts to create. Customers join a queue and get on with their day.',
  },
  {
    icon: MapPin,
    title: 'Built for real places',
    description:
      'Location verification, live dashboards, and notifications designed around how physical queues actually work.',
  },
  {
    icon: Heart,
    title: 'Respect for waiting',
    description:
      "Waiting is the worst part of a great experience. We're obsessive about making it disappear.",
  },
]
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-sand pb-24">
    <!-- Hero Section -->
    <section class="relative z-10 px-6 pt-24 pb-16 text-center">
      <div class="mx-auto max-w-4xl">
        <h1
          class="font-display text-5xl font-black text-plum md:text-7xl tracking-tight leading-none mb-8"
        >
          Zero lines. <span class="text-mint-dark">Better business.</span>
        </h1>
      </div>
    </section>

    <!-- Origin letter -->
    <section class="relative z-10 mx-auto max-w-5xl px-6">
      <div
        class="p-10 md:p-16 bg-white/40 backdrop-blur-3xl border border-plum/5 shadow-[0_40px_80px_rgba(26,10,46,0.1)] rounded-[48px]"
      >
        <div class="font-editorial text-lg text-plum-soft leading-[1.9] space-y-6">
          <p>
            <span class="font-bold text-4xl">A</span> while back, we walked into a restaurant on a
            busy Friday night. Right by the entrance stood a small podium, and behind it a
            receptionist with two, maybe three sheets of paper, a pen tucked behind her ear, writing
            down names almost faster than people could give them.
          </p>

          <p>
            Picture yourself standing there with us. The restaurant had the air conditioning
            running, you could feel it on your arms, and still she had sweat on her forehead. A
            crowd had formed right in front of her podium and nobody moved back. Every couple of
            minutes someone leaned over and asked how much longer their table would take. Others
            just stood there and stared at her hands, watching the pen move like it might explain
            something.
          </p>

          <p>
            Then a table cleared and she called a name. The wrong family stood up first, a party
            that had walked in after the one she meant to call. The people who had actually been
            waiting longer watched a stranger get seated ahead of them, and she had to stop
            everything, apologize, and explain that who gets called next depends on how many seats
            just opened and how big each group is, not simply who arrived first.
          </p>

          <p>
            She could not throw a single sheet away either. Somewhere in that stack was a name
            nobody had called yet. Each sheet had a number stamped across the top marking the order
            it was started in, and she kept flipping between them, trying to hold the whole room in
            her head at once.
          </p>

          <p>
            A few faces in that crowd she had already seen earlier that night. The place was popular
            enough that people would leave, come back an hour later, and rejoin the line hoping for
            a shorter wait this time. She had no real way of remembering who they were, and
            honestly, with everything else she was tracking, there was no point trying to. The stamp
            on a fresh slip kept marking the time, and the whole thing started again.
          </p>

          <p>
            That night was not the last time we saw it. Over the following months the same scene
            kept turning up in different rooms. A clinic where the front desk called out patient
            names from a clipboard while a phone rang unanswered beside her. A small bakery on a
            weekend morning with a line spilling onto the sidewalk and one person keeping the whole
            order in her head. A tailor's shop during a busy holiday week, a different face, the
            same podium, the same few sheets of paper.
          </p>

          <p>
            Every time, it was the same kind of person carrying the weight. Not whoever ran the
            business. The one standing at the door, who was also answering the phone, taking
            payments, and keeping the person closest to losing patience from actually losing it.
            Nobody handed her a system built for this job. Someone handed her a pen and told her to
            work it out as she went.
          </p>

          <p>
            So we started asking a plain question. Queue management already existed as a category.
            Why was almost nobody running a small, busy front door actually using it? We went and
            looked at what was out there.
          </p>

          <p>
            Most of it was built for somebody else's problem. Buzzer systems needed hardware shipped
            in, charged per unit, and went missing or broke within a year. The bigger software was
            sized for hospital networks and call centers, priced and configured for a team with time
            to set it up, not one receptionist with two hands and no spare minute. And almost
            everything else asked the guest to install an app to wait fifteen minutes for a table
            they might visit once.
          </p>

          <p>
            None of it would have helped her that night. So we set out to build the version we
            wished had existed at that podium: a queue that opens in a browser, shows the host and
            the guest the same list at the same time, and asks nothing of the person waiting except
            their name.
          </p>
        </div>

        <p class="font-editorial text-lg font-bold text-plum mt-8 text-right">The QueueBuzz team</p>
      </div>
    </section>

    <!-- Values -->
    <section class="relative z-10 mx-auto max-w-5xl px-6 mt-16">
      <div class="grid gap-6 sm:grid-cols-3">
        <div
          v-for="value in values"
          :key="value.title"
          class="p-8 bg-white/40 backdrop-blur-xl border border-plum/5 rounded-[32px] hover:bg-white transition-all"
        >
          <div class="h-12 w-12 rounded-2xl bg-mint-light flex items-center justify-center mb-6">
            <component :is="value.icon" class="h-6 w-6 text-mint-dark" />
          </div>
          <h3 class="font-display text-xl font-bold text-plum mb-2">{{ value.title }}</h3>
          <p class="font-body text-sm text-plum-soft leading-relaxed">{{ value.description }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative z-10 mx-auto max-w-3xl px-6 mt-20 text-center">
      <div class="p-10 md:p-14 bg-white/40 backdrop-blur-xl border border-plum/5 rounded-[48px]">
        <Smartphone class="h-10 w-10 text-mint-dark mx-auto mb-6" />
        <h2 class="font-display text-2xl md:text-3xl font-bold text-plum mb-4">
          Ready to ditch the line?
        </h2>
        <p class="font-body text-plum-soft mb-8 max-w-md mx-auto">
          Set up your first virtual queue in minutes free, no download required.
        </p>
        <router-link to="/guest-host/queue/create">
          <BaseButton class="h-14 px-10 text-lg font-bold">Start Free Queue</BaseButton>
        </router-link>
      </div>
    </section>
  </div>
</template>

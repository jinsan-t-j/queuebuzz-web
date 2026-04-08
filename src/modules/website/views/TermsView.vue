<script setup>
import { CalendarIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="legal-page">
    <!-- Hero Section -->
    <section
      class="mx-auto max-w-[720px] px-5 pt-10 pb-8 md:px-0 md:pt-[80px] md:pb-[48px] text-center md:text-left border-b border-plum-faint mb-8 md:mb-12"
    >
      <div
        class="text-plum-muted uppercase font-body font-medium text-sm tracking-widest mb-2 md:mb-[12px]"
      >
        LEGAL
      </div>
      <h1
        class="font-display font-bold text-plum text-[32px] md:text-[48px] tracking-[-0.02em] leading-tight mb-3"
      >
        Terms & Conditions
      </h1>
      <p class="font-body text-plum-muted text-[14px] md:text-[16px] md:max-w-[480px] md:mx-0">
        Please read these terms carefully before using QueueBuzz.
      </p>
      <div class="mt-4 md:mt-[20px] flex items-center justify-center md:justify-start">
        <CalendarIcon class="w-[14px] h-[14px] text-plum-muted" />
        <span class="font-body text-xs md:text-sm text-plum-muted ml-[6px]">
          Last updated: 1 June 2025
        </span>
      </div>
    </section>

    <!-- Content Area -->
    <section class="mx-auto max-w-[720px] px-5 pb-[48px] md:px-0 md:pb-[80px]">
      <div class="flex flex-col gap-[32px] md:gap-[40px]">
        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            1. Acceptance of Terms
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            By accessing and using QueueBuzz ("we," "our," or "us"), you agree to be bound by these
            Terms & Conditions. QueueBuzz provides a virtual queue management platform that allows
            businesses ("Hosts") to create and manage digital waitlists, and individuals
            ("Customers") to join these waitlists via a web link or QR code without needing to
            download a mobile app. If you do not agree to these terms, please do not use our
            services.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            2. Service Description
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-4">
            QueueBuzz is a cloud-based software that eliminates physical lines by enabling virtual
            waitlists.
          </p>
          <ul
            class="list-disc pl-6 space-y-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]"
          >
            <li>
              <b>For Hosts:</b> You can create, manage, and track queues, send notifications to
              Customers, and manage your capacity effectively.
            </li>
            <li>
              <b>For Customers:</b> You can join a queue provided by a Host, check your real-time
              status, and receive notifications when it is your turn.
            </li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            3. User Accounts and Responsibilities
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-4">
            <b>Host Accounts:</b> To create a queue, Hosts must register for an account using a
            valid email address through our Magic Link or Google authentication. Hosts are
            responsible for maintaining the confidentiality of their account and all activities
            occurring under it.
          </p>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            <b>Customers:</b> Customers do not need an account to join a queue but may be required
            to provide a name and, if permitted by the Host, a phone number or email for
            notifications. Customers agree to provide accurate information when joining a waitlist.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            4. Acceptable Use
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            You agree not to use QueueBuzz to:
          </p>
          <ul
            class="list-disc pl-6 space-y-2 mt-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]"
          >
            <li>Engage in any unlawful, fraudulent, or malicious activity.</li>
            <li>Spam, harass, or send unsolicited communications to Customers or Hosts.</li>
            <li>Interfere with or disrupt the integrity or performance of the platform.</li>
            <li>Attempt to gain unauthorized access to our systems or another user's account.</li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            5. Subscriptions and Payments
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            QueueBuzz offers a free tier for basic usage and Premium subscription plans for advanced
            features. Premium subscriptions are billed in advance on a recurring schedule. By
            selecting a Premium plan, you agree to pay the applicable fees automatically. We reserve
            the right to modify our pricing, but will notify active subscribers in advance. Refunds,
            if applicable, are handled on a case-by-case basis.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            6. Intellectual Property
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            All content, trademarks, logos, and features provided by QueueBuzz are the exclusive
            property of QueueBuzz. You may not copy, modify, distribute, or reverse-engineer any
            part of the service without our clear written consent.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            7. Limitation of Liability
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            QueueBuzz is provided on an "as-is" and "as available" basis. While we strive to ensure
            100% uptime and timely notifications, we do not guarantee the service will be entirely
            error-free or uninterrupted. To the fullest extent permitted by law, QueueBuzz shall not
            be liable for any direct, indirect, incidental, or consequential damages resulting from
            your use of the platform.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            8. Changes to Terms
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            We may modify these Terms & Conditions occasionally. Any changes will be posted on this
            page with an updated "Last updated" date. Your continued use of the platform after any
            changes establishes your acceptance of the revised terms.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            9. Contact Information
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            If you have any questions or concerns regarding these Terms & Conditions, please reach
            out to us at <b>legal@queuebuzz.com</b>. We aim to respond to all inquiries within 48
            hours.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

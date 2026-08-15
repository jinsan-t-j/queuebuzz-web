<script setup lang="ts">
import { CalendarIcon } from 'lucide-vue-next'

import { useSchemaOrg } from '@/composables/useSchemaOrg'

const { injectLegalSchema } = useSchemaOrg()
injectLegalSchema('terms')
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
        Terms &amp; Conditions
      </h1>
      <p class="font-body text-plum-muted text-[14px] md:text-[16px] md:max-w-[480px] md:mx-0">
        Please read these terms carefully before using QueueBuzz.
      </p>
      <div class="mt-4 md:mt-[20px] flex items-center justify-center md:justify-start">
        <CalendarIcon class="w-[14px] h-[14px] text-plum-muted" />
        <span class="font-body text-xs md:text-sm text-plum-muted ml-[6px]">
          Last updated: 7 July 2026
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
            Terms &amp; Conditions. QueueBuzz provides a virtual queue management platform that
            allows businesses ("Hosts") to create and manage digital waitlists, and individuals
            ("Customers") to join these waitlists via a web link, QR code, or a 6-character join
            code — without needing to download a mobile app. If you do not agree to these terms,
            please do not use our services.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            2. Service Description
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-4">
            QueueBuzz is a cloud-based Progressive Web App (PWA) that eliminates physical lines by
            enabling virtual waitlists. Our platform offers the following capabilities:
          </p>
          <ul
            class="list-disc pl-6 space-y-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]"
          >
            <li>
              <b>For Hosts:</b> You can create, manage, and track queues in real time; configure
              settings such as average service time, party size limits, strict queue mode, and
              optional geo-fencing; upload a profile photo and cover banner for your queue page;
              send notifications to Customers; and view queue history and analytics based on your
              subscription plan.
            </li>
            <li>
              <b>For Customers:</b> You can join a Host's queue by scanning a QR code, following a
              shared link, or entering a join code. You can check your real-time position, receive
              browser-based audio chimes, web push notifications (via Firebase Cloud Messaging), and
              haptic/vibration feedback where supported by your device. The QueueBuzz web app is
              installable as a PWA on your home screen for a native-like experience.
            </li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            3. User Accounts and Responsibilities
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-4">
            <b>Host Accounts:</b> To create a queue, Hosts must register for an account using a
            valid email address via our Magic Link (passwordless) or Google Sign-In authentication,
            powered by Firebase. Hosts are responsible for maintaining the confidentiality of their
            account and all activities occurring under it. Hosts may also start a queue without
            signing in and later claim that queue by signing in — at which point the queue is
            permanently linked to the Host account.
          </p>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            <b>Customers:</b> Customers do not require an account to join a queue. When joining,
            Customers may be asked to provide a name, and optionally a phone number or email address
            for notifications. If the Host has enabled geo-fencing, Customers must grant location
            access to verify they are within the permitted area. Customers agree to provide accurate
            information and consent to receiving push notifications if they opt in.
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
            <li>
              Abuse the join-code or queue-link system to artificially inflate or disrupt another
              Host's waitlist.
            </li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            5. Subscriptions and Payments
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-4">
            QueueBuzz offers a free tier for basic usage and paid subscription plans (Pro, Business
            Elite, and Enterprise) for advanced features. Plan-gated features include, but are not
            limited to: higher queue and guest limits, longer queue expiry windows, access to
            historical queue data, downloadable CSV reports, extended customer information, custom
            branding (profile photo &amp; cover banner), and geo-fencing.
          </p>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            Paid subscriptions are processed through our secure payment partner, Dodo Payments, and
            are billed in advance on a monthly or yearly recurring schedule. By selecting a paid
            plan, you authorize automatic billing at the applicable rate. Prices are displayed in
            the equivalent local currency. We reserve the right to modify our pricing with advance
            notice to active subscribers. Refunds are evaluated on a case-by-case basis. Enterprise
            plan inquiries should be directed to
            <b>support@queuebuzz.com</b>.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            6. Push Notifications
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            Customers may opt in to receive web push notifications powered by Firebase Cloud
            Messaging (FCM) to be alerted when their turn is approaching or has arrived. By granting
            notification permission, you agree to receive queue-related alerts from QueueBuzz. You
            can revoke this permission at any time through your browser settings. Hosts may also opt
            in to receive push notifications for queue activity, configurable from the account
            settings.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            7. Intellectual Property
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            All content, trademarks, logos, and features provided by QueueBuzz are the exclusive
            property of QueueBuzz. You may not copy, modify, distribute, or reverse-engineer any
            part of the service without our clear written consent. Content uploaded by Hosts (such
            as profile photos and cover banners) remains the property of the Host; by uploading such
            content, you grant QueueBuzz a limited licence to display it within the platform for the
            purpose of operating your queue page.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            8. Limitation of Liability
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            QueueBuzz is provided on an "as-is" and "as available" basis. While we strive to ensure
            high availability and timely notifications, we do not guarantee the service will be
            entirely error-free or uninterrupted. Estimated wait times displayed to Customers are
            calculated algorithmically and may not reflect actual wait times. To the fullest extent
            permitted by law, QueueBuzz shall not be liable for any direct, indirect, incidental, or
            consequential damages resulting from your use of the platform, including missed
            notifications or inaccurate queue position estimates.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            9. Changes to Terms
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            We may modify these Terms &amp; Conditions occasionally. Any changes will be posted on
            this page with an updated "Last updated" date. Your continued use of the platform after
            any changes establishes your acceptance of the revised terms.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            10. Contact Information
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            If you have any questions or concerns regarding these Terms &amp; Conditions, please
            reach out to us at <b>legal@queuebuzz.com</b>. We aim to respond to all inquiries within
            48 hours.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

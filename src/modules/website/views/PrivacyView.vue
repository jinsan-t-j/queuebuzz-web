<script setup lang="ts">
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
        Privacy Policy
      </h1>
      <p class="font-body text-plum-muted text-[14px] md:text-[16px] md:max-w-[480px] md:mx-0">
        We take your privacy seriously. Here's how we handle your data.
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
            1. Information We Collect
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-2">
            The information QueueBuzz collects depends directly on how you use our services:
          </p>
          <ul
            class="list-disc pl-6 space-y-2 mt-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]"
          >
            <li>
              <b>From Hosts (Businesses):</b> We collect account information such as your email
              address, business name, address, phone number, and a custom URL slug for your queue
              page. If you upload a profile photo or cover banner, those images are stored on our
              servers. Payment data (such as subscription status and billing cycle) is handled
              through our payment partner, Dodo Payments; we do not store your full card or banking
              details. We also collect notification preferences you configure in your account
              settings.
            </li>
            <li>
              <b>From Customers (Guests):</b> We collect only the information necessary to place you
              in a queue: your name or initials, and — if the Host has enabled it or you choose to
              opt in — a phone number or email address for queue status notifications. If the Host
              has enabled geo-fencing, we request your device's location coordinates at the moment
              of joining solely to verify proximity to the venue; this data is not stored beyond the
              join attempt. If you grant permission for push notifications, we collect a Firebase
              Cloud Messaging (FCM) device token to deliver alerts about your queue status. No
              account creation or app download is required.
            </li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            2. How We Use Your Information
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-2">
            We use the collected information strictly for the functional operation of the QueueBuzz
            platform:
          </p>
          <ul
            class="list-disc pl-6 space-y-2 mt-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]"
          >
            <li>To create, manage, and display digital waitlists in real time.</li>
            <li>
              To send queue status notifications via web push (FCM), browser audio/haptic alerts,
              and — if provided — SMS or email.
            </li>
            <li>
              To verify a Customer's physical location when a Host has enabled geo-fencing for their
              queue.
            </li>
            <li>
              To provide Hosts with queue analytics such as average wait times, guest load, and
              historical queue data (subject to the Host's subscription plan).
            </li>
            <li>
              To display custom branding (profile photo and cover banner) on the Host's queue join
              page.
            </li>
            <li>To process and manage Premium subscription payments through Dodo Payments.</li>
            <li>To provide customer support and troubleshoot technical issues.</li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            3. Firebase and Push Notifications
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            QueueBuzz uses Firebase (Google LLC) for authentication and push notifications. When a
            Host signs in via Magic Link or Google Sign-In, Firebase processes authentication on our
            behalf. When a Customer or Host opts into push notifications, a Firebase Cloud Messaging
            (FCM) token is generated and stored against their queue session or account to deliver
            relevant alerts. FCM tokens are subject to
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
              class="text-plum underline hover:text-plum-soft"
              >Google's Privacy Policy</a
            >. You can revoke push notification permissions at any time via your browser settings.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            4. Cookies and Local Storage
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            We use standard web technologies such as cookies and browser local storage strictly to
            maintain your session. For Hosts, this keeps you logged into your dashboard across page
            visits. For Customers, it remembers your active queue session so you do not lose your
            position if you close and reopen the page. We do not use third-party tracking cookies or
            cross-site profiling tools.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            5. Data Sharing and Disclosure
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            QueueBuzz does <b>not</b> sell your personal data. We share information only with the
            following trusted third-party service providers, solely to keep our platform
            operational:
          </p>
          <ul
            class="list-disc pl-6 space-y-2 mt-3 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]"
          >
            <li><b>Firebase (Google LLC)</b> — authentication and push notification delivery.</li>
            <li>
              <b>Dodo Payments</b> — secure processing of subscription payments for Host accounts.
            </li>
            <li>
              <b>Brevo (formerly Sendinblue)</b> — transactional email delivery for notifications
              and system messages.
            </li>
            <li>
              <b>Cloud infrastructure provider</b> — secure hosting of application data and uploaded
              images.
            </li>
          </ul>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mt-3">
            In the event of a legal request, we may disclose your information if required by
            applicable law or a valid court order.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            6. Data Retention
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            <b>Customer data</b> (names, optional contact details, and FCM tokens) is associated
            with a specific queue session. Queue history retention is governed by the Host's
            subscription plan — on lower tiers, records are automatically anonymized or deleted
            after a set number of days; on higher tiers, data may be retained longer and is
            exportable. Geo-location data is used only at join time and is not persisted.
            <b>Host data</b> (account details, uploaded images, and settings) is retained as long as
            the account remains active. Upon a confirmed account deletion request, all Host data is
            permanently deleted from our systems.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            7. Security Measures
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            We store data on secure, industry-standard encrypted servers. Host authentication is
            handled entirely via Firebase, which means QueueBuzz never stores passwords. Uploaded
            images pass through a server-side validation and resizing pipeline before storage.
            Access to production data is tightly restricted and monitored. However, no method of
            electronic data transmission or storage is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            8. Your Individual Rights
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            You have the right to access, correct, or request deletion of your personal data held by
            us. Hosts can update or delete account details directly from the Settings page in their
            dashboard; account deletion can be initiated via the Danger Zone section in Settings.
            Customers who have participated in a queue may contact us to request access to or
            erasure of their past queue entry data — we may coordinate such requests with the
            relevant Host where appropriate.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            9. Contact Us
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            If you have questions, feedback, or concerns about this policy and how your personal
            information is handled at QueueBuzz, please contact our privacy compliance team at
            <b>privacy@queuebuzz.com</b>.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

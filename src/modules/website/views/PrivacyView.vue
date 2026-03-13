<script setup>
import { CalendarIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="legal-page">
    <!-- Hero Section -->
    <section class="mx-auto max-w-[720px] px-5 pt-10 pb-8 md:px-0 md:pt-[80px] md:pb-[48px] text-center md:text-left border-b border-plum-faint mb-8 md:mb-12">
      <div class="text-plum-muted uppercase font-body font-medium text-[11px] tracking-widest mb-2 md:mb-[12px]">
        LEGAL
      </div>
      <h1 class="font-display font-bold text-plum text-[32px] md:text-[48px] tracking-[-0.02em] leading-tight mb-3">
        Privacy Policy
      </h1>
      <p class="font-body text-plum-muted text-[14px] md:text-[16px] md:max-w-[480px] md:mx-0">
        We take your privacy seriously. Here's how we handle your data.
      </p>
      <div class="mt-4 md:mt-[20px] flex items-center justify-center md:justify-start">
        <CalendarIcon class="w-[14px] h-[14px] text-plum-muted" />
        <span class="font-body text-[12px] md:text-[13px] text-plum-muted ml-[6px]">
          Last updated: 1 June 2025
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
          <ul class="list-disc pl-6 space-y-2 mt-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            <li><b>From Hosts (Businesses):</b> We collect account information, such as your email address, business name, and payment data (processed through our secure payment partners) if you are subscribed to a Premium plan.</li>
            <li><b>From Customers (Guests):</b> We collect only the information necessary to place you in a queue, such as a name or initials, and an optional phone number or email address to send you notifications regarding your queue status. No account creation or app download is required.</li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            2. How We Use Your Information
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7] mb-2">
            We use the collected information strictly for the functional operation of the QueueBuzz platform:
          </p>
          <ul class="list-disc pl-6 space-y-2 mt-2 font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            <li>To manage and operate digital waitlists efficiently.</li>
            <li>To send critical SMS or email notifications regarding your turn in a queue.</li>
            <li>To facilitate analytics for Hosts regarding average wait times and customer loads.</li>
            <li>To process payments for Premium subscriptions.</li>
            <li>To provide customer support and troubleshoot technical issues.</li>
          </ul>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            3. Cookies and Tracking Data
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            We utilize standard web technologies like cookies and local storage tokens. These are strictly used to maintain your session on our site (for example, keeping a Host logged into their dashboard, or remembering a Customer's queue join session without requiring them to sign in). We do not use third-party tracking tools to profile your activity across other websites.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            4. Data Sharing and Disclosure
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            QueueBuzz does <b>not</b> sell your personal data. We only share information with trusted third-party service providers (such as hosting platforms, email/SMS delivery partners, and payment processors) solely for the purpose of keeping our platform operational. In the event of a legal request, we may disclose your information if required by law.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            5. Data Retention
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            <b>Customer data</b> (e.g., entered names and phone numbers) is retained only for the relevant lifecycle of the queue session and Host's analytics period. Depending on the Host’s plan, historical queue records are eventually anonymized or permanently deleted. <b>Host data</b> is retained as long as the account remains active in our system. Once a requested account deletion is processed, data is permanently scrubbed.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            6. Security Measures
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            We store data on secure, industry-standard encrypted servers provided by our trusted cloud infrastructure providers. Access to this data is tightly monitored. However, no electronic transit method is 100% secure, so we cannot guarantee absolute security.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            7. Your Individual Rights
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            You hold the right to access, alter, or request the deletion of your personal data held by us. A Host can manage this via their dashboard. Customers who have used a queue can email us to exercise these rights regarding their past queue entries, though we may redirect specific data management requests directly to the Host who managed the queue.
          </p>
        </article>

        <article>
          <h2 class="font-display font-bold text-[20px] md:text-[22px] text-plum mb-[10px] md:mb-3">
            8. Contact Us
          </h2>
          <p class="font-body text-[14px] md:text-[15px] text-plum leading-[1.7]">
            If you have questions, feedback, or concerns about this policy and how your personal information is handled at QueueBuzz, please contact our privacy compliance team at <b>privacy@queuebuzz.com</b>.
          </p>
        </article>

      </div>
    </section>
  </div>
</template>

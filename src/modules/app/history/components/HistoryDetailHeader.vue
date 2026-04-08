<script setup>
/**
 * @component HistoryDetailHeader
 * @description Header for queue history detail page showing queue name,
 * date, time range, status badge, and export buttons.
 *
 * @prop {String} queueName - Name of the queue.
 * @prop {String} date - Date string (e.g. "Tuesday, 10 June 2025").
 * @prop {String} timeRange - Time range string (e.g. "9:14 AM – 12:38 PM").
 * @prop {String} status - Queue status ('Closed' | 'Terminated').
 * @prop {Boolean} isExportingCsv - Whether CSV export is in progress.
 * @prop {Boolean} isExportingPdf - Whether PDF export is in progress.
 * @emits {go-back} - User wants to navigate back to history list.
 * @emits {export-csv} - User clicked CSV export.
 * @emits {export-pdf} - User clicked PDF export.
 */

import { Loader2 } from 'lucide-vue-next'
import CalendarDateIcon from '@/assets/icons/calendar-date.svg?component'
import ClockTimeIcon from '@/assets/icons/clock-time.svg?component'
import DownloadArrowIcon from '@/assets/icons/download-arrow.svg?component'

defineProps({
  queueName: {
    type: String,
    default: 'Morning Consultation',
  },
  date: {
    type: String,
    default: 'Tuesday, 10 June 2025',
  },
  timeRange: {
    type: String,
    default: '9:14 AM – 12:38 PM',
  },
  status: {
    type: String,
    default: 'Closed',
  },
  isExportingCsv: {
    type: Boolean,
    default: false,
  },
  isExportingPdf: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['go-back', 'export-csv', 'export-pdf'])
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Title row -->
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div class="flex flex-col gap-4">
        <!-- Name + Badge -->
        <div class="flex flex-wrap items-center gap-4">
          <h1 class="font-display text-[32px] font-bold leading-tight text-plum">
            {{ queueName }}
          </h1>
          <span
            class="rounded-md bg-plum px-3 py-1 font-body text-sm font-bold uppercase tracking-[1.2px] text-white"
          >
            {{ status }}
          </span>
        </div>

        <!-- Date + Time -->
        <div class="flex flex-wrap items-center gap-4 text-plum/60">
          <div class="flex items-center gap-1">
            <CalendarDateIcon class="h-3.5 w-3.5" />
            <span class="font-body text-sm">{{ date }}</span>
          </div>
          <span class="h-1 w-1 rounded-full bg-plum/20" />
          <div class="flex items-center gap-1">
            <ClockTimeIcon class="h-3.5 w-3.5" />
            <span class="font-body text-sm">{{ timeRange }}</span>
          </div>
        </div>
      </div>

      <!-- Export buttons -->
      <div class="flex items-center gap-2">
        <button
          :disabled="isExportingCsv"
          class="inline-flex items-center gap-1.5 rounded-lg border border-plum/10 bg-transparent px-3 py-2 font-body text-sm font-bold text-plum transition-colors hover:border-plum disabled:opacity-50"
          @click="emit('export-csv')"
        >
          <Loader2 v-if="isExportingCsv" class="h-3 w-3 animate-spin" />
          <DownloadArrowIcon v-else class="h-3 w-3" />
          CSV
        </button>
        <button
          :disabled="isExportingPdf"
          class="inline-flex items-center gap-1.5 rounded-lg border border-plum/10 bg-transparent px-3 py-2 font-body text-sm font-bold text-plum transition-colors hover:border-plum disabled:opacity-50"
          @click="emit('export-pdf')"
        >
          <Loader2 v-if="isExportingPdf" class="h-3 w-3 animate-spin" />
          <DownloadArrowIcon v-else class="h-3 w-3" />
          PDF
        </button>
      </div>
    </div>
  </div>
</template>

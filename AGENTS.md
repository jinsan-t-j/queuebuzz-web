## Project

**QueueBuzz** — virtual queue management app for physical businesses in India.

### Tech Stack
- **Frontend**: Vue 3 · TypeScript · Tailwind CSS v4 · shadcn-vue · Fontsource (self-hosted fonts)
- **Backend**: Go 1.25+ · Fiber v3 · MongoDB · Redis · Firebase Admin SDK · Brevo Email API


---

## Output rules

- Vue 3 `<script setup>` only
- Tailwind utility classes only — no inline styles, no scoped CSS
  unless animation or pseudo-element is impossible with utilities
- Text content exactly as shown in Figma — do not paraphrase
- All dynamic values are props with sensible mock defaults
- All interactive elements must be functional UI interactions
  (accordions open/close, modals show/hide, toggles flip, tabs switch etc.)
- API calls use stub functions — real endpoints attached later
- Loading and empty states included for every data-driven section
- No Pinia store imports · No router guards · No auth logic
- **Session End**: Always run `npm run lint` and `npm run typecheck` before finishing.

---

## Design tokens

Tailwind v4 `@theme` is pre-configured. Use these class names directly.

**Colours**
```
bg-sand           #F7F3EE  — page bg always, never bg-white for pages
bg-white          #FFFFFF  — card surfaces only
text-plum         #1A0A2E  — primary text
text-plum-soft    #2D1B4E  — secondary surfaces
text-plum-muted   #7B6B95  — labels, captions, helpers
border-plum-faint #E8E2F0  — borders, dividers
bg-mint           #00E5A0  — primary CTA bg
text-mint         #00E5A0  — mint text on dark surfaces
bg-mint-light     #D4FFF1  — soft accent bg
text-warning      #F97316  — idle state
text-danger       #EF4444  — skip, close, delete actions
```

**Fonts**
```
font-display  →  Comfortaa Variable   headings, wordmark
font-body     →  General Sans         all UI text, buttons, labels
font-mono     →  Geist Mono           ticket numbers, codes, counters only
```
Never use: Inter, Roboto, DM Sans, Fraunces, system-ui, or any other font.

---

## Component library

**shadcn-vue** from `@/components/ui/` for:
Dialog · Select · Checkbox · Tooltip · Popover · DropdownMenu

**Base components** from `@/components/base/` for:
```
BaseButton        all buttons
BaseInput         text inputs with label + helper + error state
BaseTextarea      multiline inputs
BaseCard          white card surfaces
BaseBadge         status chips and pill labels
BaseToggle        on/off toggles (v-model compatible)
BasePillSelector  pill group selectors
BaseSlider        range slider with floating callout
BaseAvatar        circle avatar with initial letter fallback
BaseModal         overlay modal with slot
```

Only generate base components that directly correspond to a visible
UI element in the Figma design. Do not pre-create components
speculatively — if it is not in Figma, it does not get a base component.

Base components are purely presentational:
- Accept props, emit events
- Zero business logic · Zero store access · Zero API calls

Do NOT generate base components for:
- Layout concepts (columns, grids, containers) → Tailwind utilities directly
- Wrappers that just add a CSS class → Tailwind directly
- Anything that duplicates shadcn-vue primitives → use `@/components/ui/`

Do NOT recreate existing base components. Import from `@/components/base/`.
If one doesn't exist yet: use plain HTML with correct Tailwind classes
and add `<!-- TODO: replace with BaseButton once created -->`.

## When to use shadcn-vue vs Base components

| Need | Use |
|------|-----|
| Modal/dialog with accessibility traps | shadcn Dialog |
| Dropdown select | shadcn Select |
| Checkbox / radio | shadcn Checkbox |
| Date picker | shadcn Calendar |
| Simple styled button | BaseButton |
| Text input with QueueBuzz label/helper design | BaseInput |
| Status pill badge | BaseBadge |
| Custom pill group selector | BasePillSelector |

---

## Layouts — never include chrome inside views

```
AppLayout      → authenticated host — provides sidebar + topbar automatically
WebsiteLayout     → anonymous host — provides minimal header bar only and website
BlankLayout    → auth + checkout — no chrome
```

Views start directly at content level.
Never import TheNavbar, TheFooter, TheSidebar, or TheTopbar inside a view.

---

## Naming

| What | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `QueueRow.vue` |
| Single-instance | The prefix | `TheNavbar.vue` |
| Base / generic | Base prefix | `BaseButton.vue` |
| Views | PascalCase + View | `DashboardView.vue` |
| Props | camelCase | `isLoading`, `queueName` |
| Emits | kebab-case | `'call-next'`, `'close-queue'` |
| Boolean props | is / has / can | `isOpen`, `hasError`, `canEdit` |
| API stubs | use prefix + Api suffix | `useQueueApi`, `useHistoryApi` |

---

## File paths

```
Host app views + components  →  src/modules/app/[module]/views/
                                src/modules/app/[module]/components/
Customer views + components  →  src/modules/customer/views/
                                src/modules/customer/components/
Website views                →  src/modules/website/
Host app routes              →  src/router/routes/app.routes.ts
Customer routes              →  src/router/routes/customer.routes.ts
```

Generate routing files alongside views — one route entry per view generated.

---

## ─────────────────────────────────────────
## UI INTERACTIONS — ALL MUST BE FUNCTIONAL
## ─────────────────────────────────────────

Every interaction below must work in the browser after generation. Use it for reference only, build the UI according to the Figma design.
Use local `ref()` state. No store. No router.

---

### 1. Tag / multi-select input

Used in: queue creation (category tags), settings, filters.

```vue
<script setup>
const availableTags = ref(['Clinic', 'Food Stall', 'Retail', 'Salon', 'Event'])
const selectedTags  = ref(['Clinic'])

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  idx === -1
    ? selectedTags.value.push(tag)
    : selectedTags.value.splice(idx, 1)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tag in availableTags"
      :key="tag"
      :class="[
        'px-4 py-1.5 rounded-full font-body text-sm transition-colors',
        selectedTags.includes(tag)
          ? 'bg-plum text-sand font-semibold'
          : 'border border-plum-faint text-plum-muted hover:border-plum',
      ]"
      @click="toggleTag(tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
```

---

### 2. Accordion

Used in: Settings sections (mobile), FAQ, queue history grouping.

```vue
<script setup>
const openIndex = ref(null)

function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="bg-white rounded-3xl border border-plum-faint overflow-hidden
             shadow-[0_4px_24px_rgba(26,10,46,0.08)]"
    >
      <!-- Header row -->
      <button
        class="w-full flex items-center justify-between px-6 py-5"
        @click="toggle(index)"
      >
        <span class="font-body font-semibold text-sm text-plum">
          {{ item.title }}
        </span>
        <!-- Chevron rotates on open -->
        <svg
          :class="['w-4 h-4 text-plum-muted transition-transform duration-200',
                   openIndex === index ? 'rotate-180' : '']"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <!-- Content panel -->
      <div
        v-show="openIndex === index"
        class="px-6 pb-6 border-t border-plum-faint"
      >
        <slot :name="`item-${index}`">
          <p class="font-body text-sm text-plum-muted pt-4">
            {{ item.content }}
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>
```

---

### 3. Modal — trigger and dismiss

Used in: close queue confirmation, delete history, logout, danger zone actions.

```vue
<script setup>
const isOpen = ref(false)

function openModal()  { isOpen.value = true  }
function closeModal() { isOpen.value = false }
function confirm()    { emit('confirmed'); closeModal() }
</script>

<template>
  <!-- Trigger -->
  <BaseButton variant="danger" @click="openModal">
    Delete Account
  </BaseButton>

  <!-- Modal (shadcn Dialog) -->
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogContent class="bg-white rounded-3xl p-8 max-w-md w-full">
      <div class="text-center">
        <!-- Warning icon -->
        <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-[#FEF2F2]
                    flex items-center justify-center">
          <svg class="w-6 h-6 text-danger" .../>
        </div>
        <h2 class="font-display font-bold text-xl text-plum mb-2">
          Are you sure?
        </h2>
        <p class="font-body text-sm text-plum-muted mb-6">
          This cannot be undone. All data will be permanently deleted.
        </p>
        <div class="flex gap-3 justify-center">
          <BaseButton variant="ghost" @click="closeModal">Cancel</BaseButton>
          <BaseButton variant="danger" @click="confirm">Delete Forever</BaseButton>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
```

**Logout confirmation modal** follows the same pattern:
- Trigger: user avatar / sign out menu item in TheTopbar
- Heading: "Sign out?"
- Body: "You'll need to sign in again to access your dashboard."
- Buttons: "Cancel" (ghost) + "Sign out" (danger)

---

### 4. Copy to clipboard

Used in: join code, public URL, share link.

```vue
<script setup>
const copied = ref(false)

async function copyCode(text) {
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="font-mono font-semibold text-3xl text-plum tracking-widest">
      A4X9K2
    </span>
    <button
      :class="[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'font-body text-xs font-semibold transition-all',
        copied
          ? 'bg-mint-light text-[#00B87A]'
          : 'border border-plum-faint text-plum-muted hover:border-plum',
      ]"
      @click="copyCode('A4X9K2')"
    >
      <CheckIcon v-if="copied" class="w-3 h-3" />
      <CopyIcon v-else class="w-3 h-3" />
      {{ copied ? 'Copied!' : 'Copy' }}
    </button>
  </div>
</template>
```

---

### 5. QR code — display and download

Used in: active queue screen, share modal.

```vue
<script setup>
import QRCode from 'qrcode'

const qrDataUrl = ref('')
const qrValue   = 'https://queuebuzz.app/q/chaipoint-mumbai'

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(qrValue, {
    width: 200,
    margin: 2,
    color: { dark: '#1A0A2E', light: '#FFFFFF' },
  })
})

function downloadQr() {
  const a    = document.createElement('a')
  a.href     = qrDataUrl.value
  a.download = 'queuebuzz-qr.png'
  a.click()
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      alt="Queue QR code"
      class="w-40 h-40 rounded-2xl border border-plum-faint"
    />
    <div v-else class="w-40 h-40 rounded-2xl bg-plum-faint animate-pulse" />

    <BaseButton variant="ghost" size="sm" @click="downloadQr">
      <DownloadIcon class="w-4 h-4 mr-1" />
      Download QR
    </BaseButton>
  </div>
</template>
```

Install: `npm install qrcode`

---

### 6. Share (Web Share API with clipboard fallback)

Used in: queue share button, public URL share.

```vue
<script setup>
async function shareQueue() {
  const shareData = {
    title: 'Join my queue on QueueBuzz',
    text:  'Skip the wait — join my virtual queue',
    url:   'https://queuebuzz.app/q/chaipoint-mumbai',
  }

  if (navigator.share) {
    await navigator.share(shareData)
  } else {
    await navigator.clipboard.writeText(shareData.url)
    // Show copied toast
  }
}
</script>

<template>
  <BaseButton variant="ghost" @click="shareQueue">
    <ShareIcon class="w-4 h-4 mr-1" />
    Share Queue
  </BaseButton>
</template>
```

---

### 7. Pagination

Used in: queue history table, served list.

```vue
<script setup>
const currentPage = ref(1)
const totalPages  = ref(8)

function goTo(page) {
  if (page >= 1 && page <= totalPages.value)
    currentPage.value = page
}
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- Prev -->
    <button
      :disabled="currentPage === 1"
      class="w-9 h-9 rounded-xl flex items-center justify-center
             border border-plum-faint text-plum-muted
             disabled:opacity-30 hover:border-plum transition-colors"
      @click="goTo(currentPage - 1)"
    >
      <ChevronLeftIcon class="w-4 h-4" />
    </button>

    <!-- Page numbers -->
    <button
      v-for="page in totalPages"
      :key="page"
      :class="[
        'w-9 h-9 rounded-xl font-body text-sm transition-colors',
        page === currentPage
          ? 'bg-plum text-sand font-semibold'
          : 'text-plum-muted hover:bg-plum-faint',
      ]"
      @click="goTo(page)"
    >
      {{ page }}
    </button>

    <!-- Next -->
    <button
      :disabled="currentPage === totalPages"
      class="w-9 h-9 rounded-xl flex items-center justify-center
             border border-plum-faint text-plum-muted
             disabled:opacity-30 hover:border-plum transition-colors"
      @click="goTo(currentPage + 1)"
    >
      <ChevronRightIcon class="w-4 h-4" />
    </button>
  </div>
</template>
```

---

### 8. Search input (with debounce)

Used in: queue history, host search, customer name search.

```vue
<script setup>
const searchQuery = ref('')
let debounceTimer

watch(searchQuery, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', val)
  }, 300)
})
</script>

<template>
  <div class="relative">
    <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2
                       w-4 h-4 text-plum-muted pointer-events-none" />
    <input
      v-model="searchQuery"
      type="search"
      placeholder="Search by name or ticket number..."
      class="w-full h-[48px] bg-white border border-plum-faint rounded-2xl
             pl-11 pr-4 font-body text-sm text-plum
             placeholder:text-plum-muted
             focus:border-plum focus:outline-none focus:ring-0"
    />
    <button
      v-if="searchQuery"
      class="absolute right-4 top-1/2 -translate-y-1/2
             text-plum-muted hover:text-plum"
      @click="searchQuery = ''"
    >
      <XIcon class="w-4 h-4" />
    </button>
  </div>
</template>
```

---

### 9. Filter dropdown

Used in: history page, queue management. Include even if not in Figma.

```vue
<script setup>
const activeFilter = ref('all')

const filters = [
  { value: 'all',     label: 'All entries' },
  { value: 'served',  label: 'Served' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'today',   label: 'Today only' },
  { value: 'week',    label: 'This week' },
]
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="flex items-center gap-2 h-10 px-4 rounded-2xl
                     border border-plum-faint font-body text-sm text-plum
                     hover:border-plum transition-colors bg-white">
        <FilterIcon class="w-4 h-4 text-plum-muted" />
        {{ filters.find(f => f.value === activeFilter)?.label }}
        <ChevronDownIcon class="w-3 h-3 text-plum-muted ml-1" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="bg-white rounded-2xl border border-plum-faint
             shadow-[0_8px_40px_rgba(26,10,46,0.12)] p-1 min-w-[180px]"
    >
      <DropdownMenuItem
        v-for="filter in filters"
        :key="filter.value"
        :class="[
          'flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer',
          'font-body text-sm transition-colors',
          activeFilter === filter.value
            ? 'bg-mint-light text-plum font-semibold'
            : 'text-plum-muted hover:bg-plum-faint hover:text-plum',
        ]"
        @click="activeFilter = filter.value; emit('filter-change', filter.value)"
      >
        <CheckIcon
          v-if="activeFilter === filter.value"
          class="w-3.5 h-3.5 text-mint"
        />
        <span :class="activeFilter !== filter.value && 'ml-[18px]'">
          {{ filter.label }}
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

---

### 10. Download data table as CSV

Used in: history page, served list (premium feature).

```vue
<script setup>
function downloadCsv(rows, filename = 'queuebuzz-export.csv') {
  const headers = ['Ticket', 'Name', 'Status', 'Wait (min)', 'Date']
  const csvRows = [
    headers.join(','),
    ...rows.map(r =>
      [r.ticket, r.name, r.status, r.waitMin, r.date]
        .map(v => `"${v}"`)
        .join(',')
    ),
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <BaseButton variant="ghost" size="sm" @click="downloadCsv(tableRows)">
    <DownloadIcon class="w-4 h-4 mr-1.5" />
    Export CSV
  </BaseButton>
</template>
```

---

### 11. Toggle (settings, notifications)

Use `BaseToggle` which is v-model compatible:

```vue
<script setup>
const emailAlerts   = ref(true)
const pushAlerts    = ref(false)
const collectEmails = ref(true)
</script>

<template>
  <div class="flex items-center justify-between py-4
              border-b border-plum-faint last:border-0">
    <div>
      <p class="font-body font-medium text-sm text-plum">
        Queue getting busy
      </p>
      <p class="font-body text-xs text-plum-muted mt-0.5">
        Alert when queue exceeds 20 people
      </p>
    </div>
    <BaseToggle v-model="emailAlerts" />
  </div>
</template>
```

BaseToggle implementation (if it doesn't exist yet):
```vue
<!-- src/components/base/BaseToggle.vue -->
<script setup>
const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit  = defineEmits(['update:modelValue'])
</script>

<template>
  <button
    :class="[
      'relative w-11 h-6 rounded-full transition-colors duration-200',
      props.modelValue ? 'bg-mint' : 'bg-plum-faint',
    ]"
    @click="emit('update:modelValue', !props.modelValue)"
  >
    <span
      :class="[
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white',
        'shadow transition-transform duration-200',
        props.modelValue ? 'translate-x-5' : 'translate-x-0',
      ]"
    />
  </button>
</template>
```

---

### 12. Progress bar (animated)

Used in: customer waiting screen, queue capacity indicator.

```vue
<script setup>
const props = defineProps({
  value:   { type: Number, default: 0 },
  animate: { type: Boolean, default: true },
})
</script>

<template>
  <div class="w-full h-1.5 bg-plum-faint rounded-full overflow-hidden">
    <div
      :class="['h-full bg-mint rounded-full',
               animate ? 'transition-all duration-700 ease-out' : '']"
      :style="{ width: `${value}%` }"
    />
  </div>
</template>
```

---

## ─────────────────────────────────────────
## API STUBS — REPLACE WITH REAL ENDPOINTS LATER
## ─────────────────────────────────────────

Every data-driven view must include a composable with stub functions.
The view imports the composable — never fetches directly.
Real API URLs are attached in a separate phase by replacing the stub body.

### Composable pattern (one per module)

```js
// src/modules/app/queue/composables/useQueueApi.ts
/**
 * @composable useQueueApi
 * @description API stub for queue operations.
 * Phase 2: replace each stub function body with real fetch/axios call.
 */
import { ref } from 'vue'

export function useQueueApi() {
  const isLoading = ref(false)
  const error     = ref(null)

  async function fetchQueues() {
    isLoading.value = true
    error.value     = null
    try {
      // STUB — replace with: return await $fetch('/api/queues')
      await new Promise(r => setTimeout(r, 800))
      return [
        { id: '1', name: 'Morning Consultation', status: 'active',  waiting: 12 },
        { id: '2', name: 'Afternoon Walk-ins',   status: 'closed',  waiting: 0  },
      ]
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createQueue(payload) {
    isLoading.value = true
    error.value     = null
    try {
      // STUB — replace with: return await $fetch('/api/queues', { method: 'POST', body: payload })
      await new Promise(r => setTimeout(r, 600))
      return { id: 'stub-' + Date.now(), ...payload, status: 'active' }
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function closeQueue(queueId) {
    isLoading.value = true
    try {
      // STUB — replace with: await $fetch(`/api/queues/${queueId}/close`, { method: 'POST' })
      await new Promise(r => setTimeout(r, 400))
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function callNext(queueId) {
    isLoading.value = true
    try {
      // STUB — replace with: return await $fetch(`/api/queues/${queueId}/call-next`, { method: 'POST' })
      await new Promise(r => setTimeout(r, 300))
      return { id: 'stub-entry', ticketNumber: '048', name: 'Rajan K.' }
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, fetchQueues, createQueue, closeQueue, callNext }
}
```

### One composable per module — updated paths

```
src/modules/app/queue/composables/useQueueApi.ts
src/modules/app/dashboard/composables/useDashboardApi.ts
src/modules/app/settings/composables/useSettingsApi.ts
src/modules/app/history/composables/useHistoryApi.ts
src/modules/app/auth/composables/useAuthApi.ts
src/modules/customer/composables/useCustomerApi.ts
```

Each follows the same pattern: `isLoading`, `error`, stub functions
with 300–800ms simulated delay, `// STUB` comment on the line to replace.

---

## ─────────────────────────────────────────
## LOADING AND EMPTY STATES
## ─────────────────────────────────────────

Every section that fetches data must have three visual states:
**loading → empty → populated**. All three rendered conditionally.

### Loading skeleton

```vue
<template>
  <!-- Loading -->
  <div v-if="isLoading" class="flex flex-col gap-3">
    <div
      v-for="i in 4" :key="i"
      class="h-16 bg-plum-faint rounded-2xl animate-pulse"
    />
  </div>

  <!-- Empty -->
  <div
    v-else-if="items.length === 0"
    class="flex flex-col items-center justify-center py-16 gap-3"
  >
    <div class="w-12 h-12 rounded-2xl bg-plum-faint
                flex items-center justify-center">
      <InboxIcon class="w-6 h-6 text-plum-muted" />
    </div>
    <p class="font-display font-bold text-lg text-plum">Nothing here yet</p>
    <p class="font-body text-sm text-plum-muted text-center max-w-xs">
      Your queue history will appear here once you've run your first queue.
    </p>
    <BaseButton variant="primary" size="sm">
      Create your first queue
    </BaseButton>
  </div>

  <!-- Populated -->
  <div v-else class="flex flex-col gap-3">
    <QueueRow
      v-for="item in items"
      :key="item.id"
      v-bind="item"
    />
  </div>
</template>
```

### Error state

```vue
<div v-if="error" class="flex flex-col items-center justify-center py-12 gap-3">
  <div class="w-12 h-12 rounded-2xl bg-[#FEF2F2]
              flex items-center justify-center">
    <AlertCircleIcon class="w-6 h-6 text-danger" />
  </div>
  <p class="font-display font-bold text-lg text-plum">Something went wrong</p>
  <p class="font-body text-sm text-plum-muted">{{ error }}</p>
  <BaseButton variant="ghost" size="sm" @click="retry">Try again</BaseButton>
</div>
```

### Button loading state

```vue
<BaseButton :isLoading="isLoading" variant="primary" @click="handleSubmit">
  {{ isLoading ? 'Creating queue…' : 'Create Queue' }}
</BaseButton>
```

---

## ─────────────────────────────────────────
## VISUAL SPECS
## ─────────────────────────────────────────

### Cards
```
bg-white rounded-3xl border border-plum-faint
shadow-[0_4px_24px_rgba(26,10,46,0.08)] p-6
```

### Stat cards
```
bg-white rounded-[18px] border border-plum-faint
shadow-[0_4px_24px_rgba(26,10,46,0.08)] p-5
```

### Buttons
```
Primary:      bg-mint text-plum font-body font-semibold text-sm h-12 px-8 rounded-full shadow-[0_4px_24px_rgba(0,229,160,0.28)]
Ghost:        bg-transparent border border-plum text-plum font-body font-semibold text-sm h-12 px-8 rounded-full
Danger ghost: bg-transparent border border-danger text-danger font-body font-semibold text-sm h-10 px-6 rounded-full
```

### Status chips
```
Waiting:  bg-mint-light text-[#00B87A] font-semibold text-xs px-3 py-1 rounded-full
Called:   bg-[#FEF3C7] text-[#92400E] font-semibold text-xs px-3 py-1 rounded-full
Idle:     bg-[#FFF7ED] text-warning font-semibold text-xs px-3 py-1 rounded-full
Skipped:  bg-plum-faint text-plum-muted font-semibold text-xs px-3 py-1 rounded-full
```

### Typography
```
Page heading    font-display font-bold text-3xl text-plum tracking-tight
Section heading font-display font-bold text-2xl text-plum tracking-tight
Card heading    font-display font-bold text-lg text-plum
Body            font-body text-base text-plum
Body muted      font-body text-base text-plum-muted
Caption/label   font-body font-medium text-xs text-plum-muted uppercase tracking-widest
Ticket number   font-mono font-semibold text-4xl text-plum
Join code       font-mono font-semibold text-3xl text-plum tracking-widest
Button          font-body font-semibold text-sm
```

### Inputs
```html
<label class="font-body font-medium text-xs text-plum-muted uppercase tracking-widest mb-1.5 block">LABEL</label>
<input class="w-full h-[52px] bg-white border border-plum-faint rounded-[14px] px-[18px]
              font-body text-sm text-plum placeholder:text-plum-muted
              focus:border-plum focus:outline-none focus:ring-0" />
<p class="font-body text-xs text-plum-muted mt-1.5">Helper text</p>
```

### Pill selectors
```html
<div class="flex gap-2">
  <!-- Active -->
  <button class="px-4 py-2 rounded-full bg-plum text-sand font-body font-semibold text-sm">
    2 min
  </button>
  <!-- Inactive -->
  <button class="px-4 py-2 rounded-full border border-plum-faint text-plum-muted font-body text-sm">
    5 min
  </button>
</div>
```

### Spacing reference
```
gap-2=8px  gap-3=12px  gap-4=16px  gap-5=20px  gap-6=24px  gap-8=32px
p-4=16px   p-5=20px    p-6=24px    p-8=32px    p-10=40px   p-12=48px
```

### Responsive
All components and pages must be responsive and work on both desktop and mobile devices.

```
Desktop: max-w-[1200px] mx-auto px-10
Mobile:  px-5 · full width · single column
Breakpoint: md: prefix for desktop overrides
```

---

## ─────────────────────────────────────────
## WHAT TO GENERATE PER FIGMA FRAME
## ─────────────────────────────────────────

1. One `.vue` file per distinct UI section in the frame
2. The view file composing those components
3. One API stub composable for the module
4. Route entry in the correct routes file
5. File at the correct path:
   - Host app → `src/modules/app/[module]/views/` + `components/`
   - Anon host → same view components, no layout chrome
   - Customer → `src/modules/customer/views/` + `components/`
   - Website → `src/modules/website/`
6. All dynamic values as typed props with mock defaults
7. All interactive elements functional (open/close, toggle, copy etc.)
8. All data sections have loading + empty + error + populated states
9. JSDoc `@component` block at top of every `<script setup>`

---

## What NOT to generate

- No Pinia store imports
- No router.push or navigation logic
- No auth checks or guards
- No tailwind.config.js — tokens live in main.css @theme
- No separate CSS files per component
- No duplicate base components — import from `@/components/base/`
- No real API URLs — stubs only with `// STUB` comment

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **queuebuzz-web** (1981 symbols, 3713 relationships, 162 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/queuebuzz-web/context` | Codebase overview, check index freshness |
| `gitnexus://repo/queuebuzz-web/clusters` | All functional areas |
| `gitnexus://repo/queuebuzz-web/processes` | All execution flows |
| `gitnexus://repo/queuebuzz-web/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

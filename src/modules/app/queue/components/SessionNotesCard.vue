<script setup lang="ts">
/**
 * @component SessionNotesCard
 * @description Draggable sticky note for host observations.
 * Uses TipTap for rich text editing and auto-saves with debounce.
 */
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import {
  BoldIcon,
  BookOpenIcon,
  ItalicIcon,
  ListIcon,
  Loader2Icon,
  PenLineIcon,
  XIcon,
} from 'lucide-vue-next'
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  initialNotes?: string
  isSaving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'close'): void
}>()

// Drag state
const pos = ref({ x: 50, y: 250 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const editor = useEditor({
  content: props.initialNotes || '',
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Private observations...',
    }),
  ],
  editorProps: {
    attributes: {
      class:
        'prose prose-sm focus:outline-none max-w-full font-body text-sm text-plum min-h-[120px] leading-relaxed',
    },
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    // Emit empty string if content is just empty tags
    const value = editor.isEmpty ? '' : html

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      emit('update', value)
    }, 800)
  },
})

function closeNote() {
  if (editor.value) {
    const value = editor.value.isEmpty ? '' : editor.value.getHTML()
    if (value !== props.initialNotes) {
      emit('update', value)
    }
  }
  emit('close')
}

watch(
  () => props.initialNotes,
  (newVal) => {
    if (editor.value && newVal !== undefined && newVal !== editor.value.getHTML()) {
      editor.value.commands.setContent(newVal, { emitUpdate: false })
    }
  },
)

function startDrag(e: MouseEvent) {
  e.stopPropagation()
  // Don't drag if clicking buttons or editor
  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.tiptap'))
    return

  isDragging.value = true
  dragStart.value = { x: e.clientX - pos.value.x, y: e.clientY - pos.value.y }
  globalThis.addEventListener('mousemove', onDrag)
  globalThis.addEventListener('mouseup', endDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return
  pos.value = { x: e.clientX - dragStart.value.x, y: e.clientY - dragStart.value.y }
}

function endDrag() {
  isDragging.value = false
  globalThis.removeEventListener('mousemove', onDrag)
  globalThis.removeEventListener('mouseup', endDrag)
}

function startTouchDrag(e: TouchEvent) {
  e.stopPropagation()
  // Don't drag if clicking buttons or editor
  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.tiptap'))
    return

  isDragging.value = true
  const touch = e.touches[0]
  dragStart.value = { x: touch.clientX - pos.value.x, y: touch.clientY - pos.value.y }
  globalThis.addEventListener('touchmove', onTouchDrag, { passive: false })
  globalThis.addEventListener('touchend', endTouchDrag)
}

function onTouchDrag(e: TouchEvent) {
  if (!isDragging.value) return
  // Prevent scrolling while dragging on mobile
  e.preventDefault()
  const touch = e.touches[0]
  pos.value = { x: touch.clientX - dragStart.value.x, y: touch.clientY - dragStart.value.y }
}

function endTouchDrag() {
  isDragging.value = false
  globalThis.removeEventListener('touchmove', onTouchDrag)
  globalThis.removeEventListener('touchend', endTouchDrag)
}

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    if (editor.value) {
      const value = editor.value.isEmpty ? '' : editor.value.getHTML()
      emit('update', value)
    }
  }
  editor.value?.destroy()
  globalThis.removeEventListener('mousemove', onDrag)
  globalThis.removeEventListener('mouseup', endDrag)
  globalThis.removeEventListener('touchmove', onTouchDrag)
  globalThis.removeEventListener('touchend', endTouchDrag)
})
</script>

<template>
  <div
    class="absolute z-50 bg-white backdrop-blur-xl rounded-[28px] border border-plum-faint shadow-[0_20px_50px_rgba(26,10,46,0.15)] dark:shadow-none p-4 flex flex-col gap-3 w-[320px] cursor-grab active:cursor-grabbing select-none"
    :style="{ top: pos.y + 'px', left: pos.x + 'px' }"
    @mousedown.stop="startDrag"
    @touchstart.stop="startTouchDrag"
    @click.stop
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="w-7 h-7 rounded-xl bg-sand dark:bg-plum-faint/30 flex items-center justify-center"
        >
          <BookOpenIcon class="w-4 h-4 text-plum" />
        </div>
        <h3 class="font-display font-bold text-plum text-sm">Session Notes</h3>
      </div>
      <button
        class="p-1.5 hover:bg-sand dark:hover:bg-plum-faint/10 rounded-full transition-colors text-plum-muted hover:text-danger"
        @click.stop="closeNote"
        @mousedown.stop
      >
        <XIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Toolbar -->
    <div
      v-if="editor"
      class="flex items-center gap-1 p-1 bg-sand/50 dark:bg-plum-faint/30 rounded-xl border border-plum-faint dark:border-plum-faint/50 cursor-default"
    >
      <button
        class="p-1.5 rounded-lg transition-colors border-0 cursor-pointer"
        :class="
          editor.isActive('bold')
            ? 'bg-plum text-sand'
            : 'text-plum-muted hover:bg-plum-faint dark:hover:bg-plum-faint/20 hover:text-plum'
        "
        @click="editor.chain().focus().toggleBold().run()"
        @mousedown.stop
      >
        <BoldIcon class="w-3.5 h-3.5" />
      </button>
      <button
        class="p-1.5 rounded-lg transition-colors border-0"
        :class="
          editor.isActive('italic')
            ? 'bg-plum text-sand'
            : 'text-plum-muted hover:bg-plum-faint dark:hover:bg-plum-faint/20 hover:text-plum'
        "
        @click="editor.chain().focus().toggleItalic().run()"
        @mousedown.stop
      >
        <ItalicIcon class="w-3.5 h-3.5" />
      </button>
      <div class="w-px h-4 bg-plum-faint mx-0.5" />
      <button
        class="p-1.5 rounded-lg transition-colors border-0"
        :class="
          editor.isActive('bulletList')
            ? 'bg-plum text-sand'
            : 'text-plum-muted hover:bg-plum-faint dark:hover:bg-plum-faint/20 hover:text-plum'
        "
        @click="editor.chain().focus().toggleBulletList().run()"
        @mousedown.stop
      >
        <ListIcon class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Editor Content -->
    <div
      class="w-full bg-sand/20 dark:bg-plum-faint/20 border border-plum-faint dark:border-plum-faint/50 rounded-[20px] p-3 transition-all min-h-[140px] max-h-[300px] overflow-y-auto focus-within:border-plum/30 focus-within:ring-2 focus-within:ring-plum/5 cursor-text"
      @mousedown.stop
    >
      <EditorContent :editor="editor" />
    </div>

    <!-- Footer / Status -->
    <div class="flex items-center justify-between pt-2 border-t border-plum-faint cursor-default">
      <div class="flex items-center gap-2 text-[10px] font-body uppercase tracking-wider">
        <template v-if="isSaving">
          <Loader2Icon class="w-3 h-3 animate-spin text-plum-muted" />
          <span class="text-plum-muted font-medium">Syncing...</span>
        </template>
        <template v-else-if="!editor?.isEmpty">
          <div class="w-1.5 h-1.5 rounded-full bg-mint" />
          <span class="text-mint font-bold">Saved to Cloud</span>
        </template>
        <template v-else>
          <PenLineIcon class="w-3 h-3 text-plum-faint" />
          <span class="text-plum-faint">Drafting...</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
/* TipTap Specific Styles */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #7b6b95;
  opacity: 0.4;
  pointer-events: none;
  height: 0;
}

.tiptap ul {
  list-style-type: disc;
  padding-left: 1.25rem;
}

.tiptap ol {
  list-style-type: decimal;
  padding-left: 1.25rem;
}

.dark .tiptap p.is-editor-empty:first-child::before {
  color: var(--color-plum-muted);
}

.tiptap blockquote {
  border-left: 3px solid #e8e2f0;
  padding-left: 0.75rem;
  font-style: italic;
}

.dark .tiptap blockquote {
  border-left-color: rgba(232, 226, 240, 0.2);
}
</style>

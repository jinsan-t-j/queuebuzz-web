import { ref, computed } from 'vue'

export function useLiveQueue(initialEntries = [], initialSearchQuery = '') {
    const showAddGuestModal = ref(false)
    const showToast = ref(false)
    const toastMessage = ref('')

    const guestEntries = ref([...initialEntries])
    const rawSearchQuery = ref(initialSearchQuery)
    const debouncedSearchQuery = ref(rawSearchQuery.value)
    let searchTimeout = null

    const filteredEntries = computed(() => {
        if (!debouncedSearchQuery.value) return guestEntries.value
        const q = debouncedSearchQuery.value.toLowerCase()
        return guestEntries.value.filter(e => e.name.toLowerCase().includes(q))
    })

    function handleSearchUpdate(val, emitSearch) {
        rawSearchQuery.value = val
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            debouncedSearchQuery.value = val
        }, 300)

        if (emitSearch) emitSearch(val)
    }

    function handleAddGuestSubmit(values) {
        guestEntries.value.push({
            id: Date.now(),
            position: guestEntries.value.length + 1,
            name: values.name,
            partySize: 1,
            waitTime: '0m',
            status: 'waiting'
        })
        showAddGuestModal.value = false

        toastMessage.value = `${values.name} added to queue.`
        showToast.value = true
        setTimeout(() => showToast.value = false, 3000)
    }

    return {
        showAddGuestModal,
        showToast,
        toastMessage,
        guestEntries,
        rawSearchQuery,
        debouncedSearchQuery,
        filteredEntries,
        handleSearchUpdate,
        handleAddGuestSubmit
    }
}

import { defineStore } from 'pinia'
import type { HistoryQueryParams, HistoryQueryResult, QueueHistoryItem } from '@/types/app'

export const useQueueStore = defineStore('queueStore', () => {
    const dummyQueues: QueueHistoryItem[] = [
        { id: 1, date: '2023-10-24', name: 'Main Service Desk', totalServed: 128, avgWait: '12m 40s', status: 'Completed' },
        { id: 2, date: '2023-10-23', name: 'Express Checkout', totalServed: 342, avgWait: '04m 15s', status: 'Active' },
        { id: 3, date: '2023-10-22', name: 'Weekend Pop-up', totalServed: 89, avgWait: '18m 22s', status: 'Terminated' },
        { id: 4, date: '2023-10-21', name: 'Customer Returns', totalServed: 56, avgWait: '08m 50s', status: 'Paused' },
        { id: 5, date: '2023-10-20', name: 'Main Service Desk', totalServed: 145, avgWait: '11m 15s', status: 'Completed' },
        { id: 6, date: '2023-10-19', name: 'Express Checkout', totalServed: 312, avgWait: '04m 10s', status: 'Completed' },
        { id: 7, date: '2023-10-18', name: 'Repair Center', totalServed: 45, avgWait: '22m 05s', status: 'Terminated' },
        { id: 8, date: '2023-10-17', name: 'Main Service Desk', totalServed: 95, avgWait: '14m 20s', status: 'Completed' },
        { id: 9, date: '2023-10-16', name: 'Information Desk', totalServed: 211, avgWait: '10m 00s', status: 'Paused' },
        { id: 10, date: '2023-10-15', name: 'Express Checkout', totalServed: 412, avgWait: '02m 30s', status: 'Completed' }
    ]

    const fetchHistoryQueues = async (params: HistoryQueryParams = {}): Promise<HistoryQueryResult> => {
        // API Delays simulation
        await new Promise(resolve => setTimeout(resolve, 600))
        let results = [...dummyQueues]

        // Search
        if (params.search) {
            results = results.filter(q => q.name.toLowerCase().includes(params.search.toLowerCase()))
        }
        // Filter by Status
        if (params.filter && params.filter !== 'All') {
            results = results.filter(q => q.status === params.filter)
        }
        // Sorting
        if (params.sortDirection) {
            results = results.sort((a, b) => {
                return params.sortDirection === 'asc'
                    ? new Date(a.date).getTime() - new Date(b.date).getTime()
                    : new Date(b.date).getTime() - new Date(a.date).getTime()
            })
        }

        // Pagination
        const limit = params.limit || 5
        const page = params.page || 1
        const totalCount = results.length

        results = results.slice((page - 1) * limit, page * limit)

        // Date formatting matching UI representation
        results = results.map(r => ({
            ...r,
            dateFormatted: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(r.date))
        }))

        return {
            data: results,
            totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1
        }
    }

    return { fetchHistoryQueues }
})

export type EntryStatus = 'WAITING' | 'CALLED' | 'SERVED' | 'SKIPPED' | 'IDLE' | 'LEFT'

export interface Entry {
    id: string
    queueId: string
    ticketNo: number
    position?: number
    name: string
    email?: string
    phone?: string
    partySize: number
    status: EntryStatus
    waitTimeMin?: number
    servedAt?: string
    finishedAt?: string
    createdAt: string
    updatedAt?: string
}

export interface JoinQueuePayload {
    name?: string
    phone?: string
    email?: string
    partySize?: number
    notificationEnabled: boolean
    fcmToken?: string | null
}

export interface MutationResult {
    success: boolean
}

export interface JoinByCodeResult {
    found: boolean
    queueName?: string
    queueId?: string
}

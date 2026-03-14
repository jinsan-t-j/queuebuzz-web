export type UserTier = 'free' | 'premium'

export interface AuthUser {
  id: string
  name: string
  email: string
  businessName: string
  tier: UserTier
  avatar: string | null
}

export type UserTier = 'free' | 'premium'
export type SocialProvider = 'google' | 'apple'

export interface AuthUser {
  id: string
  name: string
  email: string
  businessName: string
  tier: UserTier
  avatar: string | null
}

export type UserTier = 'free' | 'premium'
export type SocialProvider = 'google' | 'apple'

export interface AuthUser {
  id: string
  publicId: string
  name: string
  email: string
  tier: UserTier
  avatar: string | null
  profileImageUrl?: string | null
  termsAccepted: boolean
}

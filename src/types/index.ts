export interface Step {
  number: number
  title: string
  description: string
}

export interface MTGCard {
  id: string
  name: string
  image_url?: string
  set?: string
} 
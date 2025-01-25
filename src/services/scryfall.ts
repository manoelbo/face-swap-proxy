const SCRYFALL_API = 'https://api.scryfall.com'

export interface ScryfallCard {
  id: string
  name: string
  set_name: string
  lang: string
  prints_search_uri: string
  image_uris?: {
    normal: string
    art_crop: string
  }
  card_faces?: Array<{
    image_uris: {
      normal: string
      art_crop: string
    }
  }>
}

export interface CardPrint {
  id: string
  name: string
  set_name: string
  lang: string
  image_uris?: {
    normal: string
  }
  card_faces?: Array<{
    image_uris: {
      normal: string
    }
  }>
  set: string
  collector_number: string
}

export async function searchCards(query: string): Promise<ScryfallCard[]> {
  try {
    const response = await fetch(
      `${SCRYFALL_API}/cards/search?q=${encodeURIComponent(query)}&unique=prints&order=released`
    )
    const data = await response.json()
    
    if (data.status === 404) {
      return []
    }

    return data.data || []
  } catch (error) {
    console.error('Erro ao buscar cartas:', error)
    return []
  }
}

export async function getCardPrints(printsSearchUri: string): Promise<CardPrint[]> {
  try {
    const url = new URL(printsSearchUri)
    url.searchParams.set('unique', 'prints')
    url.searchParams.set('include_multilingual', 'true')
    url.searchParams.set('order', 'released')

    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (!data.data) {
      throw new Error('Dados inválidos retornados pela API')
    }

    return data.data
  } catch (error) {
    console.error('Erro ao buscar versões da carta:', error)
    return []
  }
} 
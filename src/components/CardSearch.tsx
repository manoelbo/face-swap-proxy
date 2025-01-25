'use client'

import { useState, useEffect } from 'react'
import { searchCards, ScryfallCard, CardPrint } from '@/services/scryfall'
import PrintOptions from './PrintOptions'
import { logger } from '@/utils/logger'
import Image from 'next/image'

interface CardSearchProps {
  onPrintSelect: (print: CardPrint | null) => void
}

export default function CardSearch({ onPrintSelect }: CardSearchProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ScryfallCard[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrint, setSelectedPrint] = useState<CardPrint | null>(null)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    // Limpa a seleção quando o usuário começa a digitar novamente
    if (selectedCard) {
      setSelectedCard(null)
      setSelectedPrint(null)
    }
  }

  const handleSearchFocus = () => {
    // Limpa a seleção quando o usuário clica no campo de busca
    if (selectedCard) {
      setSearch('')
      setSelectedCard(null)
      setSelectedPrint(null)
    }
  }

  useEffect(() => {
    const searchCardsFromApi = async () => {
      if (search.length > 2) {
        setIsSearching(true)
        setError(null)

        try {
          const cards = await searchCards(search)
          setResults(cards)
        } catch (err: unknown) {
          logger.error('Erro ao buscar cartas:', err)
          setError('Erro ao buscar cartas')
          setResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setResults([])
      }
    }

    const timeoutId = setTimeout(searchCardsFromApi, 300)
    return () => clearTimeout(timeoutId)
  }, [search])

  const getCardImage = (card: ScryfallCard | CardPrint) => {
    if (card.image_uris?.normal) {
      return card.image_uris.normal
    }
    if (card.card_faces?.[0]?.image_uris?.normal) {
      return card.card_faces[0].image_uris.normal
    }
    return ''
  }

  // Função para determinar qual imagem mostrar
  const displayImage = selectedPrint || selectedCard

  // Atualizar o handler para notificar o componente pai
  const handlePrintSelect = (print: CardPrint | null) => {
    setSelectedPrint(print)
    onPrintSelect(print)
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            placeholder="search card name..."
            className="w-full bg-black/30 border border-gray-800 rounded px-4 py-2 text-gray-300 text-sm font-mono
              focus:outline-none focus:border-gray-600 placeholder-gray-600"
          />

          {/* Status indicator */}
          <div className="absolute right-3 top-2.5">
            {isSearching && (
              <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}

        {/* Results dropdown */}
        {results.length > 0 && !selectedCard && (
          <div className="absolute w-full mt-1 bg-black border border-gray-800 rounded shadow-lg z-10 max-h-96 overflow-y-auto">
            {results.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="w-full px-4 py-2 text-left hover:bg-gray-800/50 text-sm font-mono
                  border-b border-gray-800 last:border-0"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{card.name}</span>
                  <span className="text-gray-600 text-xs">{card.set_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected card */}
      {selectedCard && (
        <>
          <div className="border border-gray-800 rounded p-4 bg-black/30">
            <div className="flex justify-between">
              <div className="flex gap-6">
                {displayImage && (
                  <div className="relative group">
                    <Image
                      src={getCardImage(displayImage)}
                      alt={displayImage.name}
                      width={256}
                      height={356}
                      className="w-64 rounded transition-transform duration-200 group-hover:scale-105"
                    />
                    {selectedPrint && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs bg-black/80 text-gray-300 px-2 py-1 rounded">
                          {selectedPrint.set_name} #{selectedPrint.collector_number}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div className="py-2">
                  <p className="text-gray-300 text-sm mb-1">{selectedCard.name}</p>
                  <p className="text-gray-600 text-xs">{selectedCard.set_name}</p>
                  <p className="text-gray-500 text-xs mt-2">id: {selectedCard.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCard(null)
                  setSelectedPrint(null)
                }}
                className="text-gray-600 hover:text-gray-400 text-xs"
              >
                clear
              </button>
            </div>
          </div>

          <PrintOptions
            selectedCard={selectedCard}
            onPrintSelect={handlePrintSelect}
            selectedPrint={selectedPrint}
          />
        </>
      )}
    </div>
  )
} 
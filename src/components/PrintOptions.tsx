'use client'

import { useState, useEffect } from 'react'
import { ScryfallCard, CardPrint, getCardPrints } from '@/services/scryfall'
import { logger } from '@/utils/logger'

interface PrintOptionsProps {
  selectedCard: ScryfallCard
  onPrintSelect: (print: CardPrint) => void
  selectedPrint: CardPrint | null
}

// Mapa completo de códigos de idioma para nomes e códigos impressos
const languageInfo: Record<string, { name: string, printedCode: string }> = {
  en: { name: 'English', printedCode: 'en' },
  es: { name: 'Spanish', printedCode: 'sp' },
  fr: { name: 'French', printedCode: 'fr' },
  de: { name: 'German', printedCode: 'de' },
  it: { name: 'Italian', printedCode: 'it' },
  pt: { name: 'Portuguese', printedCode: 'pt' },
  ja: { name: 'Japanese', printedCode: 'jp' },
  ko: { name: 'Korean', printedCode: 'kr' },
  ru: { name: 'Russian', printedCode: 'ru' },
  zhs: { name: 'Simplified Chinese', printedCode: 'cs' },
  zht: { name: 'Traditional Chinese', printedCode: 'ct' },
  he: { name: 'Hebrew', printedCode: 'he' },
  la: { name: 'Latin', printedCode: 'la' },
  grc: { name: 'Ancient Greek', printedCode: 'grc' },
  ar: { name: 'Arabic', printedCode: 'ar' },
  sa: { name: 'Sanskrit', printedCode: 'sa' },
  ph: { name: 'Phyrexian', printedCode: 'ph' }
}

export default function PrintOptions({
  selectedCard,
  onPrintSelect,
  selectedPrint
}: PrintOptionsProps) {
  const [prints, setPrints] = useState<CardPrint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLanguages, setShowLanguages] = useState(false)

  // Separar impressões por idioma
  const printsByLang = prints.reduce((acc, print) => {
    if (!acc[print.lang]) {
      acc[print.lang] = []
    }
    acc[print.lang].push(print)
    return acc
  }, {} as Record<string, CardPrint[]>)

  // Separar cartas em inglês e outras línguas
  const englishPrints = printsByLang['en'] || []
  const otherLanguages = Object.entries(printsByLang)
    .filter(([lang]) => lang !== 'en')
    .sort(([a], [b]) => languageInfo[a]?.name.localeCompare(languageInfo[b]?.name || '') || 0)

  useEffect(() => {
    const fetchPrints = async () => {
      setLoading(true)
      setError(null)
      try {
        const cardPrints = await getCardPrints(selectedCard.prints_search_uri)
        setPrints(cardPrints)
      } catch (err: unknown) {
        logger.error('Erro ao carregar versões da carta:', err)
        setError('Erro ao carregar versões da carta')
      } finally {
        setLoading(false)
      }
    }

    fetchPrints()
  }, [selectedCard.prints_search_uri])

  return (
    <div className="border border-gray-800 rounded bg-black/30">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Print and Lang Options</p>
            <p className="text-gray-600 text-xs">
              {selectedPrint
                ? `${selectedPrint.set_name} / ${languageInfo[selectedPrint.lang]?.name || selectedPrint.lang}`
                : 'select version and language'
              }
            </p>
          </div>
          <div className="text-gray-600 text-xs">
            /card/options
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
            loading prints...
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* English Prints */}
            {englishPrints.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-gray-400 text-xs uppercase">English</p>
                  <span className="text-gray-600 text-xs">(en)</span>
                  <span className="text-gray-700 text-xs">{englishPrints.length} prints</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {englishPrints.map((print) => (
                    <button
                      key={print.id}
                      onClick={() => onPrintSelect(print)}
                      className={`p-2 border rounded text-left transition-colors ${selectedPrint?.id === print.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/30'
                        }`}
                    >
                      <p className="text-gray-300 text-xs">{print.set_name}</p>
                      <p className="text-gray-500 text-xs">#{print.collector_number}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other Languages Toggle */}
            {otherLanguages.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowLanguages(!showLanguages)}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${showLanguages ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="text-xs uppercase">Other Languages</span>
                  <span className="text-gray-600 text-xs">({otherLanguages.length})</span>
                </button>

                {/* Other Languages Content */}
                {showLanguages && (
                  <div className="space-y-4 pt-2">
                    {otherLanguages.map(([lang, prints]) => {
                      const langInfo = languageInfo[lang]
                      if (!langInfo) return null

                      return (
                        <div key={lang} className="space-y-2 border-l border-gray-800 pl-4">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-400 text-xs uppercase">{langInfo.name}</p>
                            <span className="text-gray-600 text-xs">({langInfo.printedCode})</span>
                            <span className="text-gray-700 text-xs">{prints.length} prints</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {prints.map((print) => (
                              <button
                                key={print.id}
                                onClick={() => onPrintSelect(print)}
                                className={`p-2 border rounded text-left transition-colors ${selectedPrint?.id === print.id
                                  ? 'border-purple-500 bg-purple-500/10'
                                  : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/30'
                                  }`}
                              >
                                <p className="text-gray-300 text-xs">{print.set_name}</p>
                                <p className="text-gray-500 text-xs">#{print.collector_number}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
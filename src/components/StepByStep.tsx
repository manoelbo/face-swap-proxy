'use client'

import { useState, useEffect } from 'react'
import ImageUpload from './ImageUpload'
import CardSearch from './CardSearch'
import { CardPrint } from '@/services/scryfall'
import { checkFaceSwapStatus, startFaceSwap } from '@/services/faceswap'
import Image from 'next/image'

export default function StepByStep() {
  const [selectedPrint, setSelectedPrint] = useState<CardPrint | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processId, setProcessId] = useState<string | null>(null)

  const handleImageUpload = (file: File | null) => {
    setUploadedFile(file)
  }

  const isGenerateEnabled = selectedPrint && uploadedFile

  useEffect(() => {
    if (!processId || generatedImageUrl) return

    const checkStatus = async () => {
      try {
        const status = await checkFaceSwapStatus(processId)

        if (status.status === 'completed' && status.imageUrl) {
          setGeneratedImageUrl(status.imageUrl)
          setIsGenerating(false)
          setProcessId(null)
        } else if (status.status === 'error') {
          setError(status.error || 'Erro ao gerar imagem')
          setIsGenerating(false)
          setProcessId(null)
        }
      } catch (err) {
        setError('Erro ao verificar status')
        setIsGenerating(false)
        setProcessId(null)
      }
    }

    const interval = setInterval(checkStatus, 2000)
    return () => clearInterval(interval)
  }, [processId, generatedImageUrl])

  const handleGenerate = async () => {
    if (!uploadedFile || !selectedPrint?.image_uris?.normal) return

    setIsGenerating(true)
    setError(null)
    setGeneratedImageUrl(null)

    try {
      const id = await startFaceSwap(uploadedFile, selectedPrint.image_uris.normal)
      setProcessId(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Falha ao iniciar geração: ${errorMessage}`)
      setIsGenerating(false)
    }
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-4xl font-mono">
        <div className="space-y-1 mb-8">
          <p className="text-gray-500 text-sm">{/* execution pipeline */}</p>
          <p className="text-gray-400 text-xs">status: ready</p>
        </div>

        <div className="space-y-4">
          {/* Upload Step */}
          <div className="border border-gray-800 bg-black/50 rounded">
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Data Input</p>
                  <p className="text-gray-600 text-xs">waiting for image upload...</p>
                </div>
                <div className="text-gray-600 text-xs">
                  /input/image
                </div>
              </div>
            </div>
            <div className="p-4">
              <ImageUpload onUpload={handleImageUpload} />
            </div>
          </div>

          {/* Card Search Step */}
          <div className="border border-gray-800 bg-black/50 rounded">
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Card Selection</p>
                  <p className="text-gray-600 text-xs">search MTG database</p>
                </div>
                <div className="text-gray-600 text-xs">
                  /select/card
                </div>
              </div>
            </div>
            <div className="p-4">
              <CardSearch onPrintSelect={setSelectedPrint} />
            </div>
          </div>

          {/* Generate Button */}
          {isGenerateEnabled && (
            <div className="pt-4 space-y-4">
              <button
                className={`w-full border rounded-lg py-4 px-6 font-mono text-sm transition-colors
                  ${isGenerating
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 cursor-wait'
                    : 'bg-purple-500/10 border-purple-500 text-purple-400 hover:bg-purple-500/20'
                  }`}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span>Generating Face Swap Proxy...</span>
                  </div>
                ) : (
                  'Generate Face Swap Proxy'
                )}
              </button>

              {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
              )}

              {/* Generated Image and Support Message */}
              {generatedImageUrl && (
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Generated Image Column */}
                    <div className="border border-gray-800 rounded p-4 bg-black/30">
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Generated Proxy</p>
                        <div className="max-w-[300px] mx-auto">
                          <img
                            src={generatedImageUrl}
                            alt="Generated proxy card"
                            className="w-full rounded"
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </div>
                        {!error && (
                          <a
                            href={generatedImageUrl}
                            download="proxy-card.jpg"
                            className="block w-full text-center py-2 text-sm text-gray-400 hover:text-gray-300 
                              border border-gray-800 rounded hover:bg-gray-800/30 transition-colors"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Support Message Column */}
                    <div className="border border-gray-800 rounded p-4 bg-black/30">
                      <div className="space-y-4">
                        <p className="text-gray-400 text-sm leading-relaxed">
                          This project was created by{' '}
                          <span className="font-bold text-purple-400">Dungeon Rollers</span>{' '}
                          <span className="space-x-1">
                            <span>🧙🏼‍♂️</span>
                            <span>🧝🏻‍♂️</span>
                            <span>🎲</span>
                            <span>🥋</span>
                            <span>🤙🏼</span>
                          </span>
                          , a Brazilian group of friends who love playing MTG and practicing BJJ.
                        </p>
                        <p className="text-gray-400 text-sm">
                          Support this project through this{' '}
                          <a
                            href="https://ko-fi.com/faceswapproxy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 underline"
                          >
                            link
                          </a>
                          {' '}with a donation to keep the servers running.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 
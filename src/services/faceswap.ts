"use server"

import { Client, handle_file } from "@gradio/client"

type HFToken = `hf_${string}`

interface PredictResult {
  data: Array<{
    url: string;
  }>;
}

export async function generateFaceSwap(sourceFile: File, cardUrl: string): Promise<string> {
  if (!process.env.HUGGING_FACE_TOKEN || !process.env.NEXT_PUBLIC_HUGGING_FACE_SPACE) {
    throw new Error('Credenciais do Hugging Face não configuradas')
  }

  // Garantir que o token comece com hf_
  const HF_TOKEN = process.env.HUGGING_FACE_TOKEN.startsWith('hf_') 
    ? (process.env.HUGGING_FACE_TOKEN as HFToken)
    : (`hf_${process.env.HUGGING_FACE_TOKEN}` as HFToken)

  const SPACE_NAME = process.env.NEXT_PUBLIC_HUGGING_FACE_SPACE

  try {
    console.log('Starting Gradio connection...')
    const client = await Client.connect(SPACE_NAME, {
      hf_token: HF_TOKEN
    })

    console.log('Preparing card image...')
    const cardResponse = await fetch(cardUrl)
    const cardBlob = await cardResponse.blob()

    console.log('Preparing files for upload...')
    const source = await handle_file(sourceFile)
    const target = await handle_file(cardBlob)

    console.log('Sending request to model...')
    const result = await client.predict(
      "/predict",
      [
        source,      // source_file
        target,      // target_file
        true         // doFaceEnhancer
      ]
    ) as PredictResult

    console.log('Result received:', result)

    if (!result?.data?.[0]?.url) {
      throw new Error('Image URL not found in result')
    }

    return result.data[0].url

  } catch (error) {
    console.error('Detailed face swap error:', error)
    throw new Error('Falha ao gerar a imagem. Por favor, tente novamente.')
  }
} 
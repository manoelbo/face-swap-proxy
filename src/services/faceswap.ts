"use server"

import { Client, handle_file } from "@gradio/client"

type HFToken = `hf_${string}`

interface GradioResponse {
  data: Array<{
    path: string
    url: string
    size: number | null
    orig_name: string
    mime_type: string | null
    is_stream: boolean
    meta: Record<string, unknown>
  }>
  type: string
  time: Date
  endpoint: string
  fn_index: number
}

interface ProcessStatus {
  id: string;
  status: 'pending' | 'completed' | 'error';
  imageUrl?: string;
  error?: string;
}

// Armazenamento temporário dos status (em produção usar Redis/DB)
const processQueue = new Map<string, ProcessStatus>();

export async function startFaceSwap(sourceFile: File, cardUrl: string): Promise<string> {
  const processId = crypto.randomUUID();
  
  // Inicia o processo em background
  processQueue.set(processId, { id: processId, status: 'pending' });
  
  // Não espera o processo completar
  generateFaceSwap(sourceFile, cardUrl, processId).catch(error => {
    processQueue.set(processId, {
      id: processId,
      status: 'error',
      error: error.message
    });
  });

  return processId;
}

export async function checkFaceSwapStatus(processId: string): Promise<ProcessStatus> {
  const status = processQueue.get(processId);
  if (!status) {
    throw new Error('Processo não encontrado');
  }
  return status;
}

async function generateFaceSwap(sourceFile: File, cardUrl: string, processId: string) {
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
    ) as GradioResponse

    console.log('Result received:', result)

    if (!result?.data?.[0]?.url) {
      throw new Error('URL da imagem não encontrada no resultado')
    }

    // Corrigir formatação da URL
    const imageUrl = result.data[0].url

    // Atualiza o status com sucesso
    processQueue.set(processId, {
      id: processId,
      status: 'completed',
      imageUrl: imageUrl
    });

    return imageUrl

  } catch (error) {
    // Atualiza o status com erro
    processQueue.set(processId, {
      id: processId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    console.error('Erro detalhado no face swap:', error)
    throw new Error('Falha ao gerar a imagem. Por favor, tente novamente.')
  }
} 
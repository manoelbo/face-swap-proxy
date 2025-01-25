"use server"

import { Client, handle_file } from "@gradio/client"

type HFToken = `hf_${string}`

interface PredictResult {
  data: Array<{
    url: string;
  }>;
}

interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

// Armazenar status dos jobs em memória (em produção usar Redis/DB)
const jobStatuses = new Map<string, JobStatus>();

export async function startFaceSwap(sourceFile: File, cardUrl: string): Promise<string> {
  if (!process.env.HUGGING_FACE_TOKEN || !process.env.NEXT_PUBLIC_HUGGING_FACE_SPACE) {
    throw new Error('Credenciais do Hugging Face não configuradas')
  }

  const HF_TOKEN = process.env.HUGGING_FACE_TOKEN.startsWith('hf_') 
    ? (process.env.HUGGING_FACE_TOKEN as HFToken)
    : (`hf_${process.env.HUGGING_FACE_TOKEN}` as HFToken)

  const SPACE_NAME = process.env.NEXT_PUBLIC_HUGGING_FACE_SPACE

  try {
    const client = await Client.connect(SPACE_NAME, {
      hf_token: HF_TOKEN
    })

    const source = await handle_file(sourceFile)
    const cardResponse = await fetch(cardUrl)
    const cardBlob = await cardResponse.blob()
    const target = await handle_file(cardBlob)

    // Iniciar job assíncrono
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    jobStatuses.set(jobId, {
      jobId,
      status: 'pending'
    });

    // Iniciar processamento em background
    processFaceSwap(client, source, target, jobId);

    return jobId;

  } catch (error) {
    console.error('Error starting face swap:', error)
    throw new Error('Falha ao iniciar o processo. Por favor, tente novamente.')
  }
}

async function processFaceSwap(client: any, source: any, target: any, jobId: string) {
  try {
    jobStatuses.set(jobId, { ...jobStatuses.get(jobId)!, status: 'processing' });

    const result = await client.predict(
      "/predict",
      [source, target, true]
    ) as PredictResult;

    if (!result?.data?.[0]?.url) {
      throw new Error('Image URL not found in result');
    }

    jobStatuses.set(jobId, {
      jobId,
      status: 'completed',
      result: result.data[0].url
    });

  } catch (error) {
    console.error(`Processing error for job ${jobId}:`, error);
    jobStatuses.set(jobId, {
      jobId,
      status: 'failed',
      error: 'Falha ao processar imagem'
    });
  }
}

export async function checkFaceSwapStatus(jobId: string): Promise<JobStatus> {
  const status = jobStatuses.get(jobId);
  if (!status) {
    throw new Error('Job não encontrado');
  }
  return status;
} 
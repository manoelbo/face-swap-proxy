'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <h2 className="text-xl text-red-500">Algo deu errado!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-purple-500/10 border border-purple-500 
            text-purple-400 rounded hover:bg-purple-500/20"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
} 
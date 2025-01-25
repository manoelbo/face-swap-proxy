import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Adicionar headers de segurança com configurações mais permissivas para APIs
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000')
  
  // Permitir acesso às APIs do Hugging Face e Scryfall
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Configurar Content Security Policy para permitir imagens e conexões
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data: https://cards.scryfall.io https://*.hf.space blob:",
      "connect-src 'self' https://*.hf.space https://api.scryfall.com",
      "frame-src 'self' https://*.hf.space",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
    ].join('; ')
  )
  
  // Configurar cache para imagens
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|ico)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
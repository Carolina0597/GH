import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FORGE · TH Central · Sistecredito',
  description: 'Modulo de Desempeno - Sistema de gestion de talento humano',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pakuvie Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

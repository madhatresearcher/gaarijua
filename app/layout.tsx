import '../styles/globals.css'
import Footer from '../components/Footer'
import HeaderGlassy from '../components/HeaderGlassy'
import CompareTrayProvider from '../components/CompareTrayProvider'
import AuthSessionProvider from '../components/SessionProvider'

export const metadata = {
  title: 'Gaarijua — Know Your Car.',
  description: 'Rent, buy cars and buy parts',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthSessionProvider>
          <CompareTrayProvider>
            <HeaderGlassy />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </CompareTrayProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}

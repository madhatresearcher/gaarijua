import '../styles/globals.css'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Gaarijua — Know Your Car.',
  description: 'Rent, buy cars and buy parts',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

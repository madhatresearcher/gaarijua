export default function Home() {
  return (
    <div className="prose">
      <h1>Gaarijua</h1>
      <p>Know Your Car. Rent, buy vehicles and find parts.</p>
      <div className="mt-6">
        <a href="/cars" className="mr-4 text-blue-600">Browse Cars</a>
        <a href="/parts" className="text-blue-600">Browse Parts</a>
      </div>
    </div>
  )
}

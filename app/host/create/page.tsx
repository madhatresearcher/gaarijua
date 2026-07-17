import { auth } from '../../../auth'
import CreateListingForm from '../../../components/CreateListingForm'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Create Listing — Gaarijua' }

export default async function CreateHostListingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/sign-in?callbackUrl=/host/create')

  return <main className="mx-auto max-w-3xl px-4 py-10"><CreateListingForm /></main>
}

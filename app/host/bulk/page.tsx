import { auth } from '../../../auth'
import ManageAdsPanel from '../../../components/ManageAdsPanel'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Create Multiple Listings — Gaarijua' }

export default async function BulkCreateListingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/sign-in?callbackUrl=/host/bulk')

  return <ManageAdsPanel initiallyShowCreateForm />
}

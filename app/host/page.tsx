import HostDashboard from '../../components/HostDashboard'
import { auth } from '../../auth'
import { getHostListingPage } from '../../lib/host-listings'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Manage Ads — Gaarijua',
  description: 'Create, update, and archive your auto listings.',
}

export default async function HostHomePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/sign-in?callbackUrl=/host')

  const page = await getHostListingPage(session.user.id)
  return (
    <HostDashboard
      initialListings={page.listings}
      initialNextCursor={page.nextCursor}
      initialOpenCount={page.total}
    />
  )
}

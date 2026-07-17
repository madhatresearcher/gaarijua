import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { getOwnedHostListing } from '../../../../lib/host-listings'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to view your listing.' }, { status: 401 })
  }

  const { id } = await context.params
  const listing = await getOwnedHostListing(session.user.id, id)
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  return NextResponse.json({ listing })
}

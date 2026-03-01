const ONE_DAY_MS = 24 * 60 * 60 * 1000

type ListingVisibilityRecord = {
  status?: string | null
  closed_at?: string | null
  updated_at?: string | null
}

export function isClosedListingVisible(record: ListingVisibilityRecord, now = Date.now()) {
  if ((record.status || '').toLowerCase() !== 'closed') return false
  const closedAt = record.closed_at || record.updated_at
  if (!closedAt) return false
  const closedTs = Date.parse(closedAt)
  if (Number.isNaN(closedTs)) return false
  return now - closedTs <= ONE_DAY_MS
}

export function isListingPubliclyVisible(record: ListingVisibilityRecord, now = Date.now()) {
  const status = (record.status || 'active').toLowerCase()
  if (status === 'draft') return false
  if (status === 'closed') return isClosedListingVisible(record, now)
  return true
}

export function isClosedListingForDisplay(record: ListingVisibilityRecord, now = Date.now()) {
  return (record.status || '').toLowerCase() === 'closed' && isClosedListingVisible(record, now)
}

import { handlers } from '../../../../auth'

export const { GET, POST } = handlers

// Auth.js intentionally accepts only GET and POST. Some link checkers and
// browser/network probes use HEAD for this endpoint, so terminate it before
// it reaches Auth.js and avoid an UnknownAction error in the Worker logs.
export function HEAD() {
  return new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  })
}

// GET /api/form-token — issues the signed time-to-submit token the contact
// form fetches on mount (src/lib/form-token.ts). Returns { token: null } when
// the feature is off (no FORM_SIGNING_SECRET) so clients need no branching.
import { NextResponse } from 'next/server';
import { isFormTokenEnabled, mintFormToken } from '@/lib/form-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const token = isFormTokenEnabled() ? mintFormToken() : null;
  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}

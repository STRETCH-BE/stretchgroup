// GET /api/og?locale=<en|nl> — default Open Graph image (1200×630). Black
// field, the group wordmark, the three company domains. Copy is localized
// from a small inline map (the edge bundle stays tiny). No external fonts.
import { ImageResponse } from 'next/og';
import { brand, companies } from '@/lib/site-config';

export const runtime = 'edge';

const COPY: Record<string, { kicker: string; statement: string }> = {
  en: { kicker: 'One group · Three companies', statement: 'Ceilings, walls and acoustics — from Belgium and Poland.' },
  nl: { kicker: 'Eén groep · Drie bedrijven', statement: 'Plafonds, wanden en akoestiek — uit België en Polen.' },
};

export function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get('locale') ?? 'en';
  const copy = COPY[locale] ?? COPY.en;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0A0A0A', padding: '72px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 54, height: 6, background: '#E00000' }} />
          <div style={{ marginLeft: 22, color: '#9A968F', fontSize: 24, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase' }}>{copy.kicker}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 168, fontWeight: 900, letterSpacing: -8, color: '#FFFFFF', lineHeight: 1 }}>
            STRETCH<span style={{ color: '#E00000', fontSize: 120, marginLeft: 28, letterSpacing: -4 }}>GROUP</span>
          </div>
          <div style={{ display: 'flex', color: '#B6B2AB', fontSize: 34, marginTop: 22 }}>{copy.statement}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: '#6E6B66', fontSize: 22, letterSpacing: 1 }}>{brand.domain}</div>
          <div style={{ display: 'flex', color: '#9A968F', fontSize: 22, letterSpacing: 2 }}>{companies.map((c) => c.urlLabel).join('  ·  ')}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

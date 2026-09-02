// GET /api/og — default Open Graph image (1200×630). Black field, the group
// wordmark, the three company domains. No external fonts (works on the edge).
import { ImageResponse } from 'next/og';
import { brand, companies } from '@/lib/site-config';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0A0A0A', padding: '72px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 54, height: 6, background: '#E00000' }} />
          <div style={{ marginLeft: 22, color: '#9A968F', fontSize: 24, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase' }}>One group · Three companies</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 168, fontWeight: 900, letterSpacing: -8, color: '#FFFFFF', lineHeight: 1 }}>
            STRETCH<span style={{ color: '#E00000', fontSize: 120, marginLeft: 28, letterSpacing: -4 }}>GROUP</span>
          </div>
          <div style={{ display: 'flex', color: '#B6B2AB', fontSize: 34, marginTop: 22 }}>Ceilings, walls and acoustics — from Belgium and Poland.</div>
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

// GET /api/og/[slug]?locale=<en|nl> — per-company Open Graph image. Renders
// the company name and its own domain onto the branded card; unknown slugs
// fall back to the group card copy. Copy is localized from an inline map.
import { ImageResponse } from 'next/og';
import { brand, getCompany } from '@/lib/site-config';

export const runtime = 'edge';

const KICKER: Record<string, Record<string, string>> = {
  en: {
    stretch: 'Stretch ceilings & walls · Belgium',
    'stretch-sufit': 'PVC stretch-ceiling factory · Poland',
    're-sound': 'Circular acoustic panels · Belgium',
    group: 'One group · Three companies',
    partOf: 'Part of STRETCH Group',
  },
  nl: {
    stretch: 'Spanplafonds & spanwanden · België',
    'stretch-sufit': 'Pvc-spanplafondfabriek · Polen',
    're-sound': 'Circulaire akoestische panelen · België',
    group: 'Eén groep · Drie bedrijven',
    partOf: 'Deel van STRETCH Group',
  },
};

export function GET(request: Request, { params }: { params: { slug: string } }) {
  const locale = new URL(request.url).searchParams.get('locale') ?? 'en';
  const copy = KICKER[locale] ?? KICKER.en;
  const company = getCompany(params.slug);
  const kicker = company ? copy[company.slug] : copy.group;
  const title = company ? company.name : brand.name;
  const footer = company ? company.urlLabel : brand.domain;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0A0A0A', padding: '68px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 46, fontWeight: 900, letterSpacing: -2, color: '#FFFFFF' }}>
            STRETCH<span style={{ color: '#E00000', fontSize: 34, marginLeft: 12 }}>GROUP</span>
          </div>
          <div style={{ display: 'flex', color: '#9A968F', fontSize: 20, letterSpacing: 3, textTransform: 'uppercase' }}>{brand.domain}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
            <div style={{ width: 48, height: 6, background: '#E00000' }} />
            <div style={{ marginLeft: 20, color: '#FF1A1A', fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>{kicker}</div>
          </div>
          <div style={{ display: 'flex', fontSize: title.length > 12 ? 104 : 140, fontWeight: 900, letterSpacing: -5, color: '#FFFFFF', lineHeight: 1.02, textTransform: 'uppercase' }}>{title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: '#B6B2AB', fontSize: 28 }}>{footer}</div>
          <div style={{ display: 'flex', color: '#6E6B66', fontSize: 20, letterSpacing: 2, textTransform: 'uppercase' }}>{copy.partOf}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

// ============================================================================
// STRUCTURED DATA — schema.org JSON-LD builders (GROUP EDITION).
// Render output via <JsonLd data={...} />. Uses @id URIs so schemas
// cross-reference instead of duplicating.
//
// THE ENTITY GRAPH: the product site emits
//   Organization { @id: https://stretch.mt/#organization, name: 'STRETCH',
//                  parentOrganization: { name: 'STRETCH Group' } }
// This site is the other end of that link: ONE Organization with
//   @id: https://stretchgroup.be/#organization, name: 'STRETCH Group'
// and `subOrganization` entries for the three companies, each carrying its
// own site as @id/url (STRETCH's @id is the product site's existing entity
// id so the two graphs join on the same node). Never fabricates ratings,
// prices, founding dates or addresses the brief did not verify.
// ============================================================================
import { siteUrl, brand, contact, offices, companies, areaServed, social, type Company } from '@/lib/site-config';
import { liveLocales, localeFullCodes, type Locale } from '@/i18n/config';
import { buildCanonical, localeBase } from '@/lib/seo';

export const ORG_ID = `${siteUrl}/#organization`;

const availableLanguages = liveLocales.map((l) => localeFullCodes[l]);

// The product site's node for the same address uses the bare street; the two
// graphs must agree ("Beverpark" stays in visible copy only).
const hqAddress = {
  '@type': 'PostalAddress',
  streetAddress: contact.address.street,
  addressLocality: contact.address.city,
  postalCode: contact.address.postalCode,
  addressRegion: contact.address.region,
  addressCountry: contact.address.country,
};

/** The @id each member company's own site uses (or would use) for itself. */
export function companyEntityId(c: Company): string {
  // The product site already emits https://stretch.mt/#organization for
  // STRETCH — reuse it so the two graphs share one node.
  if (c.slug === 'stretch') return 'https://stretch.mt/#organization';
  return `${c.url}/#organization`;
}

function companyNode(c: Company): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': companyEntityId(c),
    name: c.name,
    url: c.slug === 'stretch' ? 'https://stretch.mt' : c.url,
    parentOrganization: { '@id': ORG_ID },
  };
  if (c.legalName) node.legalName = c.legalName;
  if (c.founded) node.foundingDate = String(c.founded);
  if (c.founder) node.founder = { '@type': 'Person', name: c.founder };
  if (c.email) node.email = c.email;
  if (c.phoneHref) node.telephone = c.phoneHref.replace(/^tel:/, '');
  if (c.slug === 'stretch') {
    // Same address as the product site's node with this @id — byte-identical,
    // so the shared entity carries one PostalAddress, not two conflicting ones.
    node.address = hqAddress;
  } else if (c.addressLines.length > 0) {
    // addressLines[1] is "postal locality" — split so postalCode is its own property.
    const m = (c.addressLines[1] ?? '').match(/^(\S+)\s+(.+)$/);
    node.address = {
      '@type': 'PostalAddress',
      streetAddress: c.addressLines[0],
      addressLocality: m ? m[2] : c.city,
      ...(m ? { postalCode: m[1] } : {}),
      addressCountry: c.country,
    };
  }
  const sameAs = [c.url, c.altUrl?.url].filter((u): u is string => Boolean(u) && u !== node.url);
  if (sameAs.length) node.sameAs = sameAs;
  return node;
}

export function organizationSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: brand.name,
    url: siteUrl,
    description: brand.description,
    // logo: omitted until the group logo asset is supplied ([TO CONFIRM]) —
    // a URL to a missing file would be worse than no logo.
    address: hqAddress,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: contact.phone,
        email: contact.email,
        contactType: 'customer service',
        areaServed,
        availableLanguage: availableLanguages,
      },
    ],
    // Identity pages only: chat deep links (WhatsApp) are contact channels,
    // not references, so they stay in contactPoint/UI and out of sameAs.
    sameAs: social.filter((s) => s.label !== 'WhatsApp').map((s) => s.url),
    subOrganization: companies.map(companyNode),
  };
  if (brand.legalName) schema.legalName = brand.legalName;
  return schema;
}

/** WebSite node per locale, published by the ONE group Organization. */
export function websiteSchema(opts: { locale: Locale; description?: string }) {
  const origin = localeBase(opts.locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: buildCanonical(opts.locale, '/'),
    name: brand.name,
    description: opts.description ?? brand.description,
    inLanguage: localeFullCodes[opts.locale],
    publisher: { '@id': ORG_ID },
  };
}

/** The HQ as a LocalBusiness with opening hours + geo (contact + home). */
export function localBusinessSchema() {
  const hq = offices.find((o) => o.role === 'headquarters');
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness`,
    name: brand.name,
    url: siteUrl,
    telephone: contact.phone,
    email: contact.email,
    address: hqAddress,
    geo: hq?.geo ? { '@type': 'GeoCoordinates', latitude: hq.geo.lat, longitude: hq.geo.lng } : undefined,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '17:00',
      },
    ],
    areaServed,
    // No parentOrganization here: this node IS the group at its premises —
    // linking it to itself would list STRETCH Group as its own subsidiary.
  };
}

/**
 * LocalBusiness nodes for the group's OFFICES other than the HQ (Sales US,
 * Alto Design PL, STRETCH Austria). NAP data comes straight from site-config
 * offices — nothing invented; an office without a street address carries
 * locality + email only. An office that IS a member company (the Polish
 * branch trades as Alto Design, whose node already sits in subOrganization
 * with the same address, e-mail and url) is skipped so the graph never
 * describes one legal entity twice under two names.
 */
export function officeSchemas() {
  const companyUrls = new Set(companies.map((c) => c.url));
  return offices
    .filter((o) => o.role !== 'headquarters' && !(o.url && companyUrls.has(o.url)))
    .map((o) => {
      const cityLine = o.addressLines[o.addressLines.length - 1] ?? '';
      const hasStreet = o.addressLines.length > 1;
      // "postcode locality" split only makes sense on a full postal address;
      // a bare city line ("New York") must stay whole.
      const m = hasStreet ? cityLine.match(/^(\S+)\s+(.+)$/) : null;
      return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}/#office-${o.country.toLowerCase()}`,
        name: o.name,
        parentOrganization: { '@id': ORG_ID },
        address: {
          '@type': 'PostalAddress',
          ...(hasStreet ? { streetAddress: o.addressLines[0] } : {}),
          addressLocality: m ? m[2] : cityLine,
          ...(m ? { postalCode: m[1] } : {}),
          addressCountry: o.country,
        },
        ...(o.email ? { email: o.email } : {}),
        ...(o.url ? { url: o.url } : {}),
        ...(o.geo ? { geo: { '@type': 'GeoCoordinates', latitude: o.geo.lat, longitude: o.geo.lng } } : {}),
      };
    });
}

export type BreadcrumbItem = { name: string; url: string };

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** A member company's own Organization node, for its detail page. */
export function companySchema(c: Company) {
  return { '@context': 'https://schema.org', ...companyNode(c) };
}

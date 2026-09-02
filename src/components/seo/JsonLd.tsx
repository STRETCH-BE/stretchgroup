// Dumb renderer for JSON-LD structured data. Pass any builder output from
// src/lib/structured-data.ts. Renders a <script type="application/ld+json">.
import { Fragment } from 'react';

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <Fragment>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Schema is built from trusted, static site data — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Fragment>
  );
}

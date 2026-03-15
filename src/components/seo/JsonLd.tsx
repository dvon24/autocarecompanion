/**
 * JSON-LD Structured Data Components
 *
 * Provides rich snippets for Google search results.
 * - Organization: Company info
 * - WebSite: Site-level search
 * - SoftwareApplication: App store listings
 * - HowTo: Step-by-step guides (used on guide pages)
 * - TechnicalArticle: Known issues article pages (SEO/GEO)
 * - FAQ: FAQ sections on article pages
 */

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Au7o',
    url: 'https://au7o.io',
    logo: 'https://au7o.io/icons/icon-512.png',
    description:
      'AI-powered automotive repair guides and vehicle maintenance tracking.',
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Au7o',
    url: 'https://au7o.io',
    description:
      'Expert DIY car repair guides powered by AI. Step-by-step instructions tailored to your exact vehicle.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://au7o.io/get-started?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Au7o',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description:
      'AI-powered car repair guides with step-by-step instructions tailored to your vehicle.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

interface HowToJsonLdProps {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, e.g., "PT30M" for 30 minutes
  estimatedCost?: { currency: string; value: string };
  supply?: string[];
  tool?: string[];
  steps: HowToStep[];
  image?: string;
}

export function HowToJsonLd({
  name,
  description,
  totalTime,
  estimatedCost,
  supply,
  tool,
  steps,
  image,
}: HowToJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };

  if (totalTime) data.totalTime = totalTime;
  if (image) data.image = image;

  if (estimatedCost) {
    data.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: estimatedCost.currency,
      value: estimatedCost.value,
    };
  }

  if (supply && supply.length > 0) {
    data.supply = supply.map((item) => ({
      '@type': 'HowToSupply',
      name: item,
    }));
  }

  if (tool && tool.length > 0) {
    data.tool = tool.map((item) => ({
      '@type': 'HowToTool',
      name: item,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface TechnicalArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
}

export function TechnicalArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
}: TechnicalArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url,
    datePublished,
    dateModified,
    author: {
      '@type': 'Organization',
      name: 'Au7o',
      url: 'https://au7o.io',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Au7o',
      url: 'https://au7o.io',
      logo: {
        '@type': 'ImageObject',
        url: 'https://au7o.io/icons/icon-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

interface CollectionPageJsonLdProps {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  itemListElement: { name: string; url: string; description?: string }[];
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  numberOfItems,
  itemListElement,
}: CollectionPageJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems,
      itemListElement: itemListElement.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
        ...(item.description && { description: item.description }),
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

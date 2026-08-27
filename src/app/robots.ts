import { MetadataRoute } from 'next';

/**
 * `/auth/` is deliberately NOT disallowed.
 *
 * It used to be, and that is precisely what put 79 login URLs INTO Google's
 * index (GSC "Indexed, though blocked by robots.txt", 2026-08-27, trending
 * 30 -> 79 in three weeks) with another 480 in "Blocked by robots.txt".
 * A Disallow only stops the fetch — it does not stop indexing. Google still
 * indexes a blocked URL it finds linked, it just does so with no content and
 * no way to ever see a noindex. Letting it crawl and read the
 * `X-Robots-Tag: noindex` we now serve from next.config.ts is what actually
 * gets these dropped on recrawl.
 *
 * `/api/` stays blocked — those routes are expensive (several proxy paid
 * model calls) and there is nothing there to index. The one exception is
 * `/api/auth/`, explicitly re-allowed: NextAuth's own signin endpoints are
 * cheap GETs and are among the URLs already indexed, so Googlebot has to be
 * able to fetch them to see the noindex header. Google resolves Allow vs
 * Disallow by longest-match, so the narrower `/api/auth/` wins.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/auth/'],
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://au7o.io/sitemap.xml',
  };
}

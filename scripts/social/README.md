# Au7o Social Media Pipeline

Automated content generation and posting pipeline for Au7o's Facebook and Instagram pages.

## Architecture

```
Known Issues DB → Content Generator → Image Generator → Publisher → Scheduler
                      (AI)              (AI/Canvas)      (Meta API)   (cron)
```

## Content Types

### Instagram
1. **Tip Posts** (single image) — "Did you know?" style car tips from known issues
2. **Issue Alert Carousels** — Multi-slide breakdowns of common problems per model
3. **Reels** — Short video explainers (future phase)
4. **Stories** — Daily polls, quick tips, link to articles

### Facebook
1. **Article Shares** — Link posts to au7o.io articles with custom copy
2. **Tip Posts** — Same as IG but optimized for FB format
3. **Community Polls** — Engagement posts about car ownership

## Setup

1. Create a Meta Developer App at developers.facebook.com
2. Add Instagram Graph API and Pages API products
3. Get long-lived page access token
4. Set environment variables (see .env.example)

## Environment Variables

```
META_APP_ID=
META_APP_SECRET=
META_PAGE_ACCESS_TOKEN=
META_IG_USER_ID=
META_FB_PAGE_ID=
```

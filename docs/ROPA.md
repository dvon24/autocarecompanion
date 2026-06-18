# Au7o — Records of Processing Activities (ROPA)

**GDPR Article 30(1) — Controller record of processing activities**

> **DRAFT for review.** Prepared from the live codebase + data model. Fill the
> `[bracketed]` placeholders (legal entity, address, contact, Supabase region)
> and review before sending to DataRep. This is operational documentation, not
> legal advice — have it sanity-checked if you want certainty.

| Field | Value |
|---|---|
| **Controller** | [DVON Invest LLC — confirm exact registered legal entity] |
| **Trading name / service** | Au7o (au7o.io) |
| **Controller address** | [registered business address] |
| **Contact for data-protection matters** | [privacy@au7o.io or devonsroberson24@yahoo.com] |
| **EU/UK Representative (Art. 27)** | DataRep — [address provided on appointment] |
| **DPO** | Not appointed (not required — no large-scale special-category or systematic monitoring as core activity) |
| **Document date / version** | [date] · v1.0 |

---

## 1. Purpose of this record
Au7o is a consumer automotive web app/PWA: a known-issues encyclopedia plus AI
photo/video diagnosis, a vehicle "garage" with maintenance tracking, an AI chat
assistant, and a navigation feature ("Drive"). Free features are global; paid
subscriptions are currently US-only. This record lists the processing activities
involving personal data.

---

## 2. Categories of data subjects
- **Website/app visitors** (including anonymous users who use 1 free AI diagnosis/chat)
- **Registered users** (account holders)
- **Subscribers** (paying users — currently US only)
- **Lead/interest sign-ups** (prospects who submit their email)
- **People who submit feedback**

---

## 3. Processing activities

| # | Activity / purpose | Personal data categories | Data subjects | Legal basis | Key recipients (processors) | Retention |
|---|---|---|---|---|---|---|
| A1 | **Account registration & authentication** | Email, name, password hash, Google OAuth identifier, session tokens, secondary email | Registered users | Contract (Art. 6(1)(b)) | Supabase, Vercel, Google (OAuth) | Until account deletion (+ short backup window) |
| A2 | **Vehicle garage & maintenance tracking** | Vehicle year/make/model/trim, VIN (if entered), mileage logs, maintenance & modification records | Registered users | Contract | Supabase, Vercel | Until account deletion |
| A3 | **AI photo/video diagnosis** | Uploaded images/video of the vehicle/part (may incidentally contain background detail), optional caption, derived diagnosis result; spoken audio (video) transcribed | Visitors (anon, 1 free) + registered users | Contract (to provide the service); **explicit consent** for retaining cropped component samples for model improvement | OpenAI (image/audio analysis), Vercel Blob (consented cropped components only), Supabase | **Source photos/video NOT stored** by default. Consented cropped components: until consent withdrawn / account deletion. Diagnosis metadata: until deletion |
| A4 | **AI chat (hub + symptom chat)** | Chat messages, vehicle context | Visitors + registered users | Contract; legitimate interest (Art. 6(1)(f)) for aggregated/anonymized product insights | OpenAI, Supabase | Per session / until account deletion; aggregated insights anonymized |
| A5 | **Navigation ("Drive")** | Precise geolocation, destinations/queries | Registered users (location permission) | Consent (device location) / contract | Mapbox, Google Places, Tankerkönig (fuel prices, DE) | Ephemeral — not persisted long-term [confirm] |
| A6 | **Subscription & billing** | Name, email; **card data handled by Stripe (Au7o never stores card numbers)** | Subscribers (US only) | Contract | Stripe | Per Stripe + tax/accounting law |
| A7 | **Lead / interest capture** | Email address | Prospects | Consent | Supabase, Resend (if notified) | Until withdrawal |
| A8 | **Feedback** | Message, optional email, user-agent | Visitors + users | Legitimate interest | Supabase, Resend (founder notification) | Until no longer needed |
| A9 | **Transactional & notification email** | Email address | Users | Contract / legitimate interest | Resend | Transient |
| A10 | **Push notifications** (if enabled) | Push subscription token | Users (opt-in) | Consent | Browser push service / Vercel | Until unsubscribe |
| A11 | **Analytics & product measurement** | Cookie/device identifiers, usage events, truncated IP, session interactions | Visitors | **Consent** (analytics default = denied until consent given) | Google Analytics 4, Microsoft Clarity | Per provider config |
| A12 | **Security, fraud prevention, rate limiting, abuse control** | IP address, request metadata, quota counters | Visitors + users | Legitimate interest | Vercel, Supabase | Short |
| A13 | **Data-subject rights handling (DSAR)** | Identifiers needed to action access/erasure requests | Any data subject | Legal obligation (Art. 6(1)(c)) | Supabase, Vercel | Per request + audit window |

---

## 4. Recipients / sub-processors & international transfers
All processors below are engaged under data-processing terms. Most are
US-based, so processing involves **transfers outside the EEA/UK**, relying on
the **EU-US / UK Data Privacy Framework (DPF)** where the provider is certified
and/or **Standard Contractual Clauses (SCCs)**. Confirm each provider's current
transfer mechanism and that a DPA/SCC is in place.

| Processor | Role | Location | Transfer safeguard |
|---|---|---|---|
| **Supabase** | Primary database (PostgreSQL) | [confirm region — EU or US] | SCCs / DPF [confirm] |
| **Vercel** | App hosting + Vercel Blob storage | US | DPF / SCCs |
| **OpenAI** | AI processing of photos, audio, chat text | US | SCCs / DPF [confirm] |
| **Stripe** | Payment processing | US | DPF |
| **Resend** | Transactional / notification email | US | SCCs |
| **Google** | OAuth sign-in, Places API, Analytics 4 | US | DPF |
| **Mapbox** | Mapping / navigation | US | SCCs |
| **Microsoft Clarity** | Product analytics / session insights | US | DPF |
| **Tankerkönig** | Fuel-price lookup (DE market) | EU (Germany) | Intra-EEA |
| **NHTSA / VPIC** | Public vehicle/recall data, VIN decode | US (gov agency) | Public data; VIN only for decode |

> Note: `@anthropic-ai/sdk` is present in the codebase but **is not used to
> process user personal data in production** (the AI chat path runs on OpenAI).
> Remove this note if that changes.

---

## 5. Technical & organisational security measures (Art. 32)
- **Encryption in transit** — HTTPS/TLS across the app and APIs; encrypted DB connections.
- **Managed, hardened infrastructure** — Vercel (hosting) + Supabase (database); access via secrets, not committed to source.
- **Authentication** — NextAuth (Auth.js) with hashed credentials / Google OAuth; server-side sessions.
- **Access control** — admin dashboard is **founder-only**, gated server-side (404 to others); least-privilege secrets.
- **Data minimisation for images** — diagnosis source photos/video are **not retained** by default; any retained sample is **cropped to the component, with EXIF metadata and number-plates/identifying detail removed**.
- **Consent management** — GDPR consent banner; analytics storage **denied by default** until consent; per-upload + account-level AI-processing opt-out.
- **Rate limiting & abuse controls** on public APIs.
- **Data-subject rights tooling** — self-service account deletion, DSAR access/erasure endpoints, AI-processing opt-out, `/data-rights` intake.
- **Vulnerability posture** — dependencies managed; error monitoring [Sentry — if/when DSN set].

---

## 6. Data-subject rights
Au7o supports access, rectification, erasure, restriction, portability,
objection, and withdrawal of consent — via the user account, in-app account
deletion, and the `/data-rights` (DSAR) intake. Requests are also actionable
through the EU/UK Representative (DataRep) once appointed.

---

## 7. Maintenance
Review this ROPA at least annually and whenever a new processing activity,
sub-processor, or data category is introduced. Provide the current version to
DataRep within 30 days of their appointment and on material change.

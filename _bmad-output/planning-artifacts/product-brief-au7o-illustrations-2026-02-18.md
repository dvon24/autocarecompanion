---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - docs/PRODUCT_BRIEF.md
  - _bmad-output/brainstorming/Au7o/brainstorming-session-2026-01-28.md
  - _bmad-output/brainstorming/Au7o/brainstorming-session-2026-01-28-resource-constraints.md
  - _bmad-output/brainstorming/Au7o/brainstorming-session-2026-01-28-what-if-scenarios.md
date: 2026-02-18
author: Devon
---

# Product Brief: Au7o Illustrations

## Executive Summary

Au7o Illustrations brings Chilton-quality technical diagrams to AI-generated repair guides - at scale. By generating exploded views, cutaway drawings, and step-synced visuals alongside Au7o's existing guide pipeline, users gain the confidence to see what they're working on before they commit. This is a new frontier: no one is combining AI guide generation with AI illustration generation for automotive DIY.

**Primary goal:** Enhance Au7o guides with visual context that shows complexity upfront, ensures users are working on the right parts, and reduces "I messed up the reassembly" moments.

**Secondary goal:** If illustration quality proves high enough, productize as a standalone API/service for licensing.

**Key risk to validate:** Can AI generate technically accurate automotive illustrations that users trust enough to follow?

---

## Core Vision

### Problem Statement

Text-only repair guides leave users guessing. Even well-written AI guides can't convey spatial relationships, part locations, or disassembly sequences the way a visual can. Users discover complexity *under the car* instead of *before they start* - leading to frustration, mistakes, and unnecessary shop visits.

### Problem Impact

- **First-time DIYers** abandon repairs mid-task when reality doesn't match expectations
- **Enthusiasts** waste time scrubbing YouTube for the right frame on the right model
- **Everyone** benefits from visual confirmation they're working on the correct component
- **Reassembly errors** happen when users can't remember how parts fit together

### Why Existing Solutions Fall Short

| Solution | Limitation |
|----------|------------|
| Chilton/Haynes manuals | $30-40 per vehicle, manually illustrated, can't scale |
| YouTube walkthroughs | Scrubbing to find right frame, hope it's the right model year |
| Factory service manuals | Expensive, dense, hard to come by |
| Forum posts | Inconsistent quality, phone photos, unreliable |

None of these sync with AI-generated guide steps. None scale dynamically across vehicles.

### Proposed Solution

**Au7o Illustrations** generates technical visuals in parallel with Au7o guide generation:

- **Exploded-view diagrams** showing part relationships and assembly order
- **Cutaway drawings** revealing hidden components
- **Location diagrams** showing where parts are on the vehicle
- **Step-synced visuals** that match each guide step

**Visual style:** Modern take on Chilton - cleaner lines, subtle color, animated/interactive elements without being distracting.

**Technical approach:** AI-generated illustrations using procedural templates, potentially combining image generation AI with vector/SVG tools. Exact approach TBD through validation.

### Key Differentiators

1. **Existing pipeline integration** - Illustrations plug directly into Au7o's guide generation flow
2. **Sync with guide steps** - Visuals match the exact procedure, not generic diagrams
3. **AI-powered scale** - Generate for any vehicle, not manual illustration per model
4. **Knowledge architecture expertise** - Devon's KM background applied to structuring visual information
5. **First-mover advantage** - No one is combining AI guides + AI illustrations for automotive DIY

---

## Target Users

### Primary Users

**The "Preview Before I Commit" DIYer**

DIY vehicle owners who want to visually understand a repair job before getting under the car. They use illustrations to:

- **Assess complexity** - See what's involved before committing to a repair
- **Locate parts** - Confirm they're looking at and working on the correct component
- **Follow along** - Reference illustrations as steps are completed, with visuals updating to reflect current progress
- **Reassemble correctly** - Use exploded views to remember how parts fit back together

**Skill levels served:** Beginners through experienced DIYers tackling unfamiliar systems. The common thread is wanting visual confirmation regardless of experience level.

**Trust requirements:** Accuracy is paramount. Illustrations must match what users actually see on their vehicle, with correct labels, clear callouts, and accurate torque specs.

### Secondary Users

**Professional Mechanics**

Mechanics can benefit from Au7o Illustrations but are not the primary audience. Professional shops typically have access to OEM service manuals and diagnostic tools. Au7o Illustrations may serve as a supplementary reference but is built for DIYers first.

### User Journey

1. **Discovery:** Users find illustrations through Au7o - integrated directly into the guide experience
2. **First Experience:** The "aha" moment is seeing the illustrated part match exactly what's on their car while working on it
3. **Core Usage:** As guide steps are completed or selected, illustrations reflect the current part/step being worked on
4. **Trust Building:** Accuracy builds trust - when the illustration matches reality, users gain confidence in the entire guide

### Technical Approach (Multi-Agent Pipeline)

Accuracy is achieved through a structured multi-agent workflow:

1. **Research Agent** - Collects reference images and technical illustrations from internet sources
2. **Illustration Agent** - Builds the technical illustration from reference material
3. **QA Agent** - Validates accuracy against source material and known specs
4. **Publishing Agent** - Publishes approved illustrations to the guide system

---

## Success Metrics

### User Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Illustration Accuracy** | Match or exceed Chilton manual quality | User feedback ("matches what I see"), QA agent validation pass rate |
| **User Confidence** | High confidence in following illustrations | Post-repair survey, "would you recommend" score |
| **Referral Rate** | Users recommend Au7o to friends | Referral tracking, word-of-mouth mentions in forums |
| **"Aha" Moment** | User finds exact issue as shown | Feedback: "illustration matched my problem exactly" |

**Success indicator:** Users trust the illustrations enough to complete repairs they wouldn't have attempted otherwise.

### Business Objectives

| Objective | Description |
|-----------|-------------|
| **Drive Premium Subscriptions** | Free users have limited guide access; illustrations as a premium value-add incentivize upgrades |
| **B2B Licensing Revenue** | Once quality is proven, license illustration engine to other companies/businesses |
| **Competitive Differentiation** | Illustrations make Au7o the obvious choice over text-only competitors |

### Key Performance Indicators

| KPI | Target | Timeframe |
|-----|--------|-----------|
| **Premium Conversion Rate** | Increase in free-to-premium upgrades after illustrations launch | 3-6 months post-launch |
| **Guide Completion Rate** | Higher completion rate for guides with illustrations vs. without | Ongoing comparison |
| **Accuracy Validation Rate** | % of illustrations passing QA agent validation | Per illustration batch |
| **User Recommendation Score** | Users willing to recommend Au7o with illustrations | Quarterly survey |
| **B2B Licensing Interest** | Inbound inquiries from potential licensees | 12+ months (secondary goal) |

---

## MVP Scope

### Core Features

**Vehicle Scope:** Dodge Challenger only (all model years/trims supported by Au7o)

**Illustration Types (All Four):**
1. **Exploded-view diagrams** - Part relationships and assembly order
2. **Cutaway drawings** - Hidden component visibility
3. **Location diagrams** - Where parts are on the vehicle
4. **Step-synced visuals** - Illustrations that match each guide step

**Animation:** Include animated elements where they clarify procedure (not static-only)

**Multi-Agent Pipeline (Full):**
1. Research Agent → Reference collection
2. Illustration Agent → Visual generation
3. QA Agent → Accuracy validation
4. Publishing Agent → Guide integration

**Integration:** Fully integrated into Au7o guide flow - illustrations generate alongside guides, not as separate feature

### Out of Scope for MVP

- **Other vehicles** - No generalization beyond Challenger
- **B2B licensing infrastructure** - No standalone API or licensing system
- **User feedback system** - No crowdsourced accuracy improvement loop
- **Premium tier gating** - Illustrations available to all users during validation phase

### MVP Success Criteria

**Primary validation gate:** Devon successfully completes an oil change on his Challenger using only Au7o guide + generated illustrations, able to:
- Accurately follow each step
- Locate every component shown in illustrations
- Confirm illustrations match what he sees on the vehicle

**Secondary signals:**
- QA agent validation pass rate (baseline to be established)
- No critical accuracy errors that would lead to mistakes

**Decision point:** Once primary validation passes, expand illustration support to additional Challenger procedures, then other vehicles.

### Future Vision

**Post-MVP expansion:**
- Generalize to all vehicles in Au7o database
- User feedback loop for accuracy improvement
- B2B licensing API for third parties
- Interactive/3D illustration exploration
- Offline illustration caching for garage use

**Long-term vision: Design generation**
- ADRO-style aftermarket design generation (body kits, aero parts, accessories)
- 3D-printable STL/CAD output for users to realize custom parts
- Vehicle-specific fitment data baked into designs
- Bridge from "understand your car" to "customize your car"

**Moonshot: AI + 3D printing car company**
- Full vehicle design generated by AI
- Modular, 3D-printable components
- From illustrating cars → designing parts → building cars

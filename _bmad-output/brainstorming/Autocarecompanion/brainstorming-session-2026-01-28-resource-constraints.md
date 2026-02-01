## RESOURCE CONSTRAINTS

**Technique Type:** Structured
**Goal:** Generate innovative solutions by imposing extreme limitations - forces essential priorities and creative efficiency under pressure

**Why This Technique:** Devon has limited time availability due to day job. This technique forces ruthless prioritization and identifies what's truly essential vs. nice-to-have.

---

### Constraint #1: The 1-Week Sprint
**Limitation:** 1 week to launch functional MVP

**Devon's Response:**
- **What gets built:** AI chat with guides feature (if free time exists)
- **Features cut:** User accounts, vehicle dashboard
- **Minimum viable product:** AI chat that produces guides and parts found around internet
- **Shortcuts:** Build in ChatGPT, create GPT model, embed on website
- **1-Week MVP:** GPT model on website that gets parts based on user task/issue

**Key Insight:** Core value = AI chat + guides + parts. Everything else is secondary.

---

### Constraint #2: The $0 Budget
**Limitation:** Zero dollars for hosting, APIs, services, or tools

**Devon's Response:**
- **AI without budget:** Unrealistic - custom GPTs require paid subscription. Could use free ChatGPT to manually create guides for each car and save locally.
- **Hosting:** ChatGPT's website or build free website to upload documents
- **Parts recommendations:** Through manually built part guides in free mode (very hard)
- **Free alternatives:** Unsure
- **$0 Architecture:** Very hard and time consuming. Would require copying each guide/parts manually and hosting on free website.

**Key Insight:** AI features are essential but require budget. $0 constraint forces manual labor that defeats agility goal.

---

### Constraint #3: The No-Code-Only Rule
**Limitation:** Only use no-code tools (Bubble, Webflow, Airtable, Zapier, etc.)

**Devon's Response:**
- **Forces back to Bubble:** Yes
- **No-code stack choice:** Bubble (AutoCare Companion already on web with Bubble)
- **Impossible features:** Features aren't impossible, but require more creativity to achieve
- **What's gained:** Lower learning curve. Knows HTML/CSS but drag-and-drop makes building easier.
- **No-code agility path:** **CRITICAL INSIGHT** - "Bubble achieves what I want to do, the issue is that it isn't as agile in future development although they're working toward AI functionality, the AI lacks the knowledge in making the right changes that incorporate the goal of the website or other features on the website."

**Key Insight:** Problem isn't Bubble's capabilities - it's that Bubble's AI agents don't understand AutoCare Companion's context and goals. Real need = AI agents that understand YOUR app's architecture.

---

### Constraint #4: The Solo Forever Scenario
**Limitation:** Never have help - no developers, no AI agents, no contractors

**Devon's Response:**
- **Architecture decisions:** Keep using Bubble and figure out ways to get to product
- **Professional context:** "I'm a career Knowledge Manager and have developed solutions that have won me awards"
- **Solo maintainability:** Current Bubble setup is maintainable alone, but relies heavily on AI for data and keeping YMMT database updated
- **Too complex solo:**
  - 3D model cars showing part location synced with checklist progress
  - Keeping YMMT database up to date for every year
- **Bus factor 1 safe design:** AI Chat, AI created guides and parts
- **Solo-maintainable version:** AI Chat, AI created guides and parts

**Key Insights:**
- Devon is a professional Knowledge Manager with award-winning solutions (not typical solo founder)
- YMMT database maintenance is a recurring constraint
- 3D model feature acknowledged as too complex for solo maintenance
- Core sustainable product = AI chat + guides + parts

---

### Constraint #5: The 1-Hour-Per-Week Limit
**Limitation:** Only 1 hour per week for maintenance + features + everything

**Devon's Response:**
- **What breaks first:** Matching user YMMT with AI workflow looking for it
- **Needs automation/elimination:** Adding YMMT into database
- **User support/bugs/features:** Would be limited - biggest issue is can't update database and troubleshoot
- **"Zero maintenance" means:** No fixing of any issues. AI model updated via plugin when new one comes out.
- **1-Hour/Week Design:**
  - 10 mins: Adding YMMT
  - 10 mins: Working on features
  - 20 mins: Troubleshooting user issues
  - 20 mins: Creating/updating AI and MCP to assist with limited time

**Key Insight:** YMMT database updates are the biggest bottleneck (appears in C4 & C5). This is the real constraint, not feature development time.

---

## Resource Constraints - Pattern Analysis

### The Immovable Core (Appears in Every Scenario)
✅ AI chat interface
✅ AI-generated guides
✅ Parts recommendations

**Decision:** These three features ARE AutoCare Companion. Everything else is enhancement.

---

### Critical Bottleneck Identified: YMMT Database Maintenance

**Evidence:**
- C4: "Too complex to manage solo: keeping up with YMMT data"
- C5: "10 mins adding YMMT" + "What breaks first: Matching user YMMT with AI workflow"

**Questions to Explore:**
- Why manually maintain YMMT data?
- What if YMMT was crowdsourced from user input?
- What if AI handled YMMT matching dynamically without database?
- Could YMMT database be eliminated - users describe "2023 Dodge Challenger R/T Scat Pack" and AI handles rest?

---

### The Bubble Paradox (Breakthrough Insight from C3)

**Devon's revelation:** "Bubble achieves what I want to do, the issue is that it isn't as agile in future development... the AI lacks the knowledge in making the right changes that incorporate the goal of the website or other features."

**Real Problem:** Not Bubble's capabilities, but Bubble's AI agents lacking AutoCare Companion context.

**Potential Solution:** Create AI context/documentation that teaches agents (Claude/ChatGPT) how AutoCare Companion works - "BMAD methodology" as knowledge architecture.

---

### The Knowledge Manager Advantage

**Devon's background:** Career Knowledge Manager with award-winning solutions.

**Reframe:** AutoCare Companion isn't a technical challenge - it's a knowledge architecture challenge (Devon's expertise).

**Question:** How do KM principles solve the YMMT database problem? Could car maintenance knowledge be structured like an enterprise knowledge base?

---

### Feature Tier Hierarchy (From Constraints)

**Tier 1 - Core MVP (Week 1):**
- AI chat + guides + parts

**Tier 2 - Deferred:**
- User accounts
- Vehicle dashboard

**Tier 3 - Too Complex Solo / Post-PMF:**
- 3D model cars
- Collaboration features
- Advanced tracking

---

## Real Constraints Ranked by Impact

1. **YMMT database maintenance** (C4, C5 - biggest bottleneck)
2. **Bubble's AI context gap** (C3 - blocks agility)
3. **Solo sustainability** (C4, C5 - bus factor 1 concern)
4. **AI API costs** (C2 - requires budget)
5. **Time availability** (C1, C5 - but efficient when available)

---

## Three Paths Forward

**Path A: Stay in Bubble + Build AI Context**
- Create comprehensive documentation of Bubble app for AI agents
- Solve YMMT bottleneck with dynamic AI matching vs database
- Accept Bubble limitations, work around with AI assistance

**Path B: Hybrid Approach (Bubble + Custom)**
- Keep Bubble for rapid prototyping
- Build critical pieces (YMMT, AI orchestration) in custom code
- Bubble as frontend, custom backend for flexibility

**Path C: Full Migration with KM Architecture**
- Apply Knowledge Manager expertise to rebuild architecture
- Design for "bus factor 1" sustainability from ground up
- Automate or eliminate YMMT database dependency

**Status:** PATH C SELECTED ✅

---

## Path C Decision — Full Migration (2026-01-31)

**Devon's Decision:** Path C - Full Migration with KM Architecture

**Devon's Rationale:**
- Bubble costs $134/month - migration eliminates this recurring cost
- Feels more agile and custom with own website
- Wants to host own domain and database
- Believes custom build is probably cheaper long-term

**What This Means:**
- Migrate entirely off Bubble.io
- Own domain + own database (self-hosted)
- Apply Knowledge Manager expertise to architecture design
- Design for bus factor 1 sustainability
- Eliminate or automate YMMT database dependency
- Full control over stack, AI integration, and feature velocity

**Key Questions for What If Scenarios:**
- What tech stack best serves a solo KM-architect building an AI-first automotive app?
- How to handle YMMT data without a manual database?
- What hosting/database options make sense at this scale?
- How to structure the app so AI agents (Claude, ChatGPT) can maintain it effectively?
- What does "zero maintenance" look like on a custom stack?

---

**Resource Constraints Technique: COMPLETE ✅**

**Outcome:** Path C selected - full migration off Bubble to self-hosted custom build

**Next:** What If Scenarios technique to explore the possibilities and risks of Path C

---

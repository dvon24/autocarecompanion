# Au7o Product Brief

## Vision
AI-powered automotive repair guides that empower DIY mechanics with expert-level guidance, interactive 3D visualizations, and seamless part sourcing.

---

## Current State (MVP v1 - Completed)
- VIN decoding for vehicle identification
- AI symptom chat for diagnosis
- AI-generated step-by-step repair guides
- Pre-flight checklist with parts/tools
- Affiliate links to retailers (Amazon, AutoZone, RockAuto, etc.)
- YouTube tutorial/review links
- Offline support (PWA)
- Region-based retailer prioritization

---

## MVP v2 - Immediate Changes

### 1. Remove User Login
**Priority:** High
**Rationale:** Reduce friction for new users. Login adds complexity without current benefit.
**Action:** Remove authentication requirement, allow anonymous usage.

### 2. Email Capture for Interest
**Priority:** High
**Rationale:** Build waitlist/interest without full account system.
**Implementation:** Simple "Get notified about new features" email input.
**Privacy:** Add to privacy policy - email used only for product updates.

### 3. Custom Vehicle Entry
**Priority:** High
**Rationale:** Users may have vehicles not in VIN database or prefer manual entry.
**Implementation:**
- Allow users to manually enter Year/Make/Model/Trim
- AI validates the combination is real
- Store in localStorage like VIN-decoded vehicles

### 4. Feedback Submission
**Priority:** Medium
**Rationale:** Collect user feedback for continuous improvement.
**Implementation:** Simple feedback form accessible from guide pages.

### 5. Enhanced References in Guides
**Priority:** Medium
**Rationale:** Increase user confidence with authoritative sources.
**Implementation:**
- Add forum links (Reddit, car-specific forums)
- Chilton/Haynes manual references where applicable
- YouTube video links (already implemented)

---

## Near-term Features (Post-MVP)

### Usage Limits & Subscription Model
**Rationale:** Sustainable business model based on API token costs.

**Free Tier:**
- X guides per month (TBD based on cost analysis)
- X symptom chat questions per month
- Basic features

**Paid Subscription:**
- Unlimited guides
- Unlimited chat questions
- Priority support
- Offline guide saving

**Action Required:** Calculate average token cost per guide/chat to determine pricing.

---

## Future Vision (Phase 2+)

### 3D Interactive Car Models

**Concept:** As users navigate through guide checklists, a 3D model of the car shows:
- Where the part is located
- What components to remove
- Exploded view animations
- Interactive manipulation (rotate, zoom, remove parts)

**Inspiration:** Car Mechanic Simulator 2021/2025

**Technical Approach:**
- Use AI tools (Meshy AI, Rodin, 3D-Agent) to generate car models
- Prompt template for generation:
  ```
  "Hyper-realistic 3D model of a [Car Model], high-fidelity detail,
  clean topology, PBR textures, 4k resolution. Include realistic wheels,
  glass windows, and metallic paint. Optimized for 3D software export,
  game-ready mesh, cinematic lighting, industrial design style."
  ```
- For exploded views: Add "exploded view parts" to prompt
- For performance: Add "low-poly" for web/mobile optimization

**Sync with Guide Steps:**
- Each guide step highlights relevant parts in 3D model
- Users can interact with model to understand what to remove
- Progress tracking reflected in model state

### Multi-Agent Architecture

**Concept:** Team of AI agents with defined roles working together.

**Agent Roles:**
1. **Guide Generator Agent** - Creates step-by-step repair guides
2. **Parts Identifier Agent** - Identifies required parts and tools
3. **Diagnosis Agent** - Symptom analysis and problem identification
4. **3D Model Agent** - Generates/manages 3D visualizations
5. **Quality Assurance Agent** - Validates guide accuracy
6. **Feedback Processing Agent** - Incorporates user feedback

**Data Model Awareness:**
- Each agent understands its role in the system
- Agents aware of other agents' actions and outputs
- Shared context for consistent user experience

**Workflow:**
1. User describes symptom → Diagnosis Agent
2. Diagnosis suggests repair → Guide Generator Agent
3. Guide created → Parts Identifier Agent adds parts list
4. Guide displayed → 3D Model Agent syncs visualization
5. User provides feedback → Feedback Agent updates system
6. QA Agent validates changes

**Feedback Loop System:**
- User feedback automatically processed
- Agent observations incorporated
- Continuous improvement without manual intervention

### AI Animation Team

**Concept:** Dedicated agents for generating web animations and 3D content.

**Responsibilities:**
- Generate 3D car models per vehicle
- Create exploded view animations
- Sync animations with guide steps
- Optimize for web performance

**Organizational Structure:**
- Lead Animation Agent (coordinates)
- Model Generation Agents (create 3D assets)
- Animation Agents (create movement/transitions)
- Optimization Agent (ensure web performance)

---

## Technical Considerations

### 3D Model Integration
- WebGL/Three.js for browser rendering
- glTF format for models
- Progressive loading for performance
- Mobile-optimized versions

### Agent Communication
- Shared state management
- Event-driven architecture
- Message queue for agent coordination

### Cost Management
- Token usage tracking per feature
- Caching for repeated queries
- Efficient prompt engineering

---

## Open Questions

1. **Subscription Pricing:** What's the break-even price based on API costs?
2. **3D Model Quality vs Performance:** How detailed can models be while staying performant?
3. **Agent Orchestration:** What framework for multi-agent coordination?
4. **User Feedback Priority:** How to prioritize which feedback to act on?

---

## Timeline (Rough)

| Phase | Features | Status |
|-------|----------|--------|
| MVP v1 | Core guides, VIN decode, symptom chat | Done |
| MVP v2 | Remove login, email capture, custom vehicle, feedback | In Progress |
| Phase 2 | Subscription model, usage limits | Planned |
| Phase 3 | 3D models (basic), enhanced references | Future |
| Phase 4 | Multi-agent system, AI animations | Vision |

---

*Last Updated: February 2026*

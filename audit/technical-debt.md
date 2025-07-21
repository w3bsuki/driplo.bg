# Technical Debt Registry

**Last Updated**: January 21, 2025  
**Total Items**: 28  
**Estimated Total Effort**: 45-60 developer days

## Debt Classification

### 🔴 Critical (Must Fix Before Launch)

| ID | Description | Effort | Business Impact | Dependencies | Files Affected |
|----|-------------|--------|-----------------|--------------|----------------|
| TD-001 | Missing database tables (4 tables) | **M** (1 day) | Features completely broken | None | Migration files |
| TD-002 | Missing database columns (37+ columns) | **M** (1 day) | Profile/brand features fail | TD-001 | `profiles` table |
| TD-003 | N+1 query in bulk order processing | **S** (4 hours) | 30-sec timeouts on bulk ops | None | `api/orders/bulk/+server.ts` |
| TD-004 | Missing payment system integration | **XL** (2-3 weeks) | Cannot process payments | TD-002 | New feature development |
| TD-005 | select('*') overfetching (15+ instances) | **M** (1 day) | Data leaks, 3-5x bandwidth | None | Multiple files |
| TD-006 | Missing RLS policies on 3 tables | **S** (4 hours) | Security vulnerability | TD-001 | Database policies |
| TD-007 | 44 unindexed foreign keys | **S** (2 hours) | 10-100x slower JOINs | None | All tables |

### 🟡 High Priority (Fix in First Month)

| ID | Description | Effort | Business Impact | Dependencies | Files Affected |
|----|-------------|--------|-----------------|--------------|----------------|
| TD-008 | Client-side data fetching for SEO content | **L** (1 week) | Poor SEO rankings | None | browse, leaderboard pages |
| TD-009 | Images without lazy loading/optimization | **M** (2-3 days) | 2-10MB extra downloads | None | ProfileHeader, TopSellers, etc |
| TD-010 | No caching layer for static data | **L** (3-5 days) | Unnecessary DB load | None | Category queries |
| TD-011 | Missing pagination on list queries | **M** (2 days) | Memory issues at scale | None | Browse, orders, listings |
| TD-012 | No composite indexes for common queries | **S** (4 hours) | Slower complex queries | TD-007 | Database indexes |
| TD-013 | 105 unused indexes | **S** (2 hours) | Slower writes, wasted space | None | Database cleanup |

### 🟢 Medium Priority (Nice to Have)

| ID | Description | Effort | Business Impact | Dependencies | Files Affected |
|----|-------------|--------|-----------------|--------------|----------------|
| TD-014 | External avatar service dependencies | **M** (2 days) | Extra latency, no control | None | Throughout app |
| TD-015 | No virtual scrolling for large lists | **M** (3 days) | DOM bloat on large pages | None | Browse, category pages |
| TD-016 | Using exact counts on large tables | **S** (2 hours) | +100ms query time | None | Browse pages |
| TD-017 | Missing request validation | **M** (3 days) | Potential security issues | None | API endpoints |
| TD-018 | No progressive enhancement | **L** (1 week) | Poor offline experience | None | Forms, navigation |
| TD-019 | Inefficient category structure queries | **M** (2 days) | Repeated DB calls | TD-010 | Category components |

### 🔵 Low Priority (Future Improvements)

| ID | Description | Effort | Business Impact | Dependencies | Files Affected |
|----|-------------|--------|-----------------|--------------|----------------|
| TD-020 | No WebP/AVIF image support | **M** (2 days) | 20-30% larger images | TD-009 | Image pipeline |
| TD-021 | Missing database views for complex queries | **M** (3 days) | Complex app logic | None | Database layer |
| TD-022 | No edge function optimization | **L** (1 week) | Higher latency globally | None | Deployment config |
| TD-023 | Bundle size not optimized | **M** (2 days) | Slower initial load | None | Build configuration |
| TD-024 | No A/B testing framework | **L** (1 week) | Can't optimize conversions | None | New infrastructure |
| TD-025 | Missing analytics integration | **M** (3 days) | No usage insights | None | Throughout app |
| TD-026 | No automated testing suite | **XL** (2-3 weeks) | Risk of regressions | None | New test files |
| TD-027 | Documentation gaps | **L** (1 week) | Onboarding friction | None | README, docs |
| TD-028 | No monitoring/alerting | **M** (3 days) | Blind to issues | None | Infrastructure |

## Effort Sizing

- **S (Small)**: < 1 day
- **M (Medium)**: 1-3 days  
- **L (Large)**: 1 week
- **XL (Extra Large)**: 2+ weeks

## Priority Matrix

```
Impact ↑
  High │ TD-004  │ TD-001,002,003 │ TD-005,006,007
       │ TD-008  │ TD-009,010,011 │
       │         │                │
Medium │ TD-018  │ TD-014,015     │ TD-012,013
       │ TD-022  │ TD-016,017,019 │
       │         │                │
   Low │ TD-024  │ TD-020,021,023 │ 
       │ TD-026  │ TD-025,027,028 │
       └─────────┴────────────────┴──────────────→
         Low        Medium           High
                   Effort
```

## Suggested Resolution Order

### Week 1: Critical Database & Security
1. TD-007: Add foreign key indexes (2 hours)
2. TD-001: Apply missing table migrations (1 day)
3. TD-002: Apply missing column migrations (1 day)
4. TD-006: Add RLS policies (4 hours)
5. TD-003: Fix N+1 queries (4 hours)

### Week 2: Data & Performance
6. TD-005: Fix select('*') overfetching (1 day)
7. TD-012: Add composite indexes (4 hours)
8. TD-013: Drop unused indexes (2 hours)
9. TD-011: Add pagination (2 days)
10. TD-016: Switch to estimated counts (2 hours)

### Week 3-4: SEO & User Experience
11. TD-008: Convert to server-side rendering (1 week)
12. TD-009: Implement image optimization (3 days)

### Week 5-7: Payment System
13. TD-004: Implement Stripe integration (3 weeks)

### Week 8+: Optimization & Polish
14. TD-010: Add caching layer (5 days)
15. TD-014: Replace external avatar services (2 days)
16. TD-015: Add virtual scrolling (3 days)
17. TD-019: Optimize category queries (2 days)

## Risk Assessment

### High Risk Items
- **TD-004**: Payment system is blocking revenue
- **TD-001/002**: Database misalignment causing failures
- **TD-006**: Security vulnerability from missing RLS

### Technical Risk
- **TD-008**: SEO rewrite could introduce bugs
- **TD-004**: Payment integration complexity

### Business Risk  
- **TD-005**: Data leaks from overfetching
- **TD-003**: Bulk operations failing at scale

## Cost of Delay

### Per Week of Delay
- **TD-004 (Payments)**: ~$50K in lost GMV
- **TD-008 (SEO)**: ~20% less organic traffic
- **TD-003 (N+1)**: Support tickets from timeouts
- **TD-009 (Images)**: 20% higher bounce rate

## Notes

1. Many items are interconnected - fixing database issues first unlocks other improvements
2. Payment system (TD-004) is the largest single item but highest business value
3. Quick wins available: TD-007, TD-013, TD-016 can be done in < 1 day total
4. Consider bringing in specialist for payment integration to reduce risk
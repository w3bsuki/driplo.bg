# Release Checklist

This checklist ensures a smooth and safe deployment process for Driplo.bg

## Pre-Release (1-2 days before)

### Code Quality
- [ ] All CI checks are passing on main branch
- [ ] TypeScript errors: 0 (run `pnpm run check`)
- [ ] ESLint warnings: 0 (run `pnpm run lint`)
- [ ] Test coverage above 80% (run `pnpm run test:coverage`)
- [ ] All E2E tests passing (run `pnpm run test:e2e`)
- [ ] Performance tests passing (Lighthouse scores >90)

### Security & Dependencies
- [ ] No critical security vulnerabilities (run `pnpm audit`)
- [ ] All dependencies up to date (check `pnpm outdated`)
- [ ] Environment variables properly configured in Vercel
- [ ] Secrets rotation completed if needed

### Database & Infrastructure
- [ ] Database migrations tested and ready
- [ ] Supabase RLS policies reviewed and tested
- [ ] Backup procedures verified
- [ ] CDN cache invalidation plan ready
- [ ] Rate limiting tested and configured

### Testing & QA
- [ ] Manual testing completed on staging environment
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness verified (iOS, Android)
- [ ] Accessibility testing with screen reader
- [ ] Performance testing under load
- [ ] Error monitoring and alerting tested

## Release Day

### Final Checks
- [ ] Main branch is stable and all checks passing
- [ ] Team notification sent
- [ ] Monitoring dashboards ready
- [ ] Support team briefed on changes
- [ ] Rollback plan reviewed and ready

### Deployment Process
- [ ] Create release branch from main: `git checkout -b release/v1.x.x`
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md with release notes
- [ ] Create GitHub release with proper tags
- [ ] Trigger deployment via GitHub Actions or manual process
- [ ] Verify deployment completion in Vercel dashboard

### Immediate Post-Deploy (within 15 minutes)
- [ ] Health check endpoints responding correctly
- [ ] Main user flows working (browse, auth, checkout)
- [ ] Error monitoring showing no spike in errors
- [ ] Performance metrics within acceptable ranges
- [ ] CDN serving updated assets correctly

### Post-Deploy Verification (within 1 hour)
- [ ] All core features functioning correctly
- [ ] Database connections stable
- [ ] Third-party integrations working (Stripe, email, etc.)
- [ ] Analytics and tracking functioning
- [ ] Search and filtering working properly
- [ ] Image uploads and processing working
- [ ] User registration and authentication flows working

## Post-Release (24-48 hours)

### Monitoring & Analysis
- [ ] Monitor error rates and performance metrics
- [ ] Review user feedback and support tickets
- [ ] Check analytics for unusual patterns
- [ ] Monitor database performance and query times
- [ ] Review CDN usage and cache hit rates

### Documentation & Communication
- [ ] Update internal documentation if needed
- [ ] Post release announcement to team
- [ ] Update status page if applicable
- [ ] Archive deployment artifacts
- [ ] Schedule post-mortem if issues occurred

## Emergency Rollback Procedure

If critical issues are discovered:

### Immediate Actions (within 5 minutes)
- [ ] Assess severity of the issue
- [ ] Notify team lead and stakeholders
- [ ] Initiate rollback via Vercel dashboard
- [ ] Post incident status update

### Rollback Steps
- [ ] Revert to previous Vercel deployment
- [ ] Verify previous version is working correctly
- [ ] Roll back database migrations if necessary
- [ ] Clear CDN cache if needed
- [ ] Update monitoring and status page

### Post-Rollback
- [ ] Confirm all systems are stable
- [ ] Document the issue and rollback process
- [ ] Schedule post-incident review
- [ ] Plan fix for the issue
- [ ] Communicate resolution to stakeholders

## Release Types

### Patch Release (1.0.x)
- Bug fixes
- Security patches
- Minor improvements
- No breaking changes

### Minor Release (1.x.0)
- New features
- Enhancements
- Non-breaking changes
- Database schema additions

### Major Release (x.0.0)
- Breaking changes
- Major new features
- Architecture changes
- Requires migration guide

## Emergency Contacts

- **Team Lead**: [Contact info]
- **DevOps**: [Contact info]  
- **Database Admin**: [Contact info]
- **Security Team**: [Contact info]

## Tools & Resources

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Error Monitoring**: Sentry dashboard
- **Performance Monitoring**: Web Vitals dashboard
- **Status Page**: [Status page URL if applicable]

---

## Release Sign-off

- [ ] **Developer**: Code changes reviewed and tested
- [ ] **QA Lead**: All testing completed successfully  
- [ ] **Team Lead**: Release approved for deployment
- [ ] **Security**: Security review completed (if applicable)

**Release Manager**: _______________  
**Date**: _______________  
**Version**: _______________
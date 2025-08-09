# 🔧 GitHub Actions Setup Guide

This guide helps you configure the GitHub Actions CI/CD pipeline for the Driplo project.

## 🗂️ Workflows Overview

The project includes comprehensive CI/CD workflows:
- **`ci.yml`** - Main CI/CD pipeline with quality checks, tests, build, and deployment
- **`release.yml`** - Release management workflow  
- **`dependency-update.yml`** - Automated dependency updates

## 🔐 Required Repository Secrets

Add these secrets in **GitHub Repository Settings** → **Secrets and variables** → **Actions**:

### Essential Secrets (Required for CI to work)
```bash
PUBLIC_SUPABASE_URL            # Your Supabase project URL
PUBLIC_SUPABASE_ANON_KEY       # Your Supabase anonymous key
```

### Optional Secrets (Advanced features)
```bash
CODECOV_TOKEN                  # Code coverage reporting
VERCEL_TOKEN                   # Vercel deployment status checks
VERCEL_URL                     # Your Vercel deployment URL  
LHCI_GITHUB_APP_TOKEN         # Lighthouse CI integration
```

## 🚀 Quick Setup Steps

### 1. Add Essential Secrets
```bash
# Go to your GitHub repo
# Settings → Secrets and variables → Actions → New repository secret

# Add these from your .env.local file:
PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Verify Workflow Files
The workflows are already configured and ready to use:
- ✅ Quality checks (TypeScript, ESLint, Prettier)
- ✅ Unit tests with coverage
- ✅ E2E tests with Playwright
- ✅ Build verification
- ✅ Security scans
- ✅ Dependency review

### 3. Test the Pipeline
Create a pull request to test the full pipeline:
```bash
git checkout -b test/github-actions
git commit --allow-empty -m "test: trigger GitHub Actions"
git push origin test/github-actions
# Create PR on GitHub
```

## 📋 Workflow Details

### Quality Job
- TypeScript type checking (`pnpm check`)
- ESLint code quality (`pnpm lint`)
- Prettier format verification (`pnpm format:check`)
- Uploads errors as artifacts if failures occur

### Test Job
- Unit tests with coverage (`pnpm test:coverage`)
- Uploads coverage reports to Codecov (if token provided)
- Generates test result artifacts

### E2E Job  
- Playwright end-to-end tests (`pnpm test:e2e`)
- Tests against built application
- Uploads test reports and screenshots on failure

### Build Job
- Production build verification (`pnpm build`)
- Bundle size analysis (`pnpm analyze`)
- Uploads build artifacts

### Security Job
- npm audit for vulnerabilities (`pnpm audit`)
- CodeQL security analysis
- Dependency review for PRs

## 🔧 Troubleshooting

### Common Issues

#### "Missing environment variable" errors
**Problem**: Tests fail due to missing Supabase credentials
**Solution**: Add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` secrets

#### Playwright tests timeout
**Problem**: E2E tests fail with timeout errors
**Solution**: The workflow includes proper wait times, but check your app's startup speed

#### Build fails on "Cannot find module"
**Problem**: Missing dependencies or TypeScript errors
**Solution**: Run `pnpm install` and `pnpm check` locally first

#### CodeQL analysis fails
**Problem**: Security scan doesn't complete
**Solution**: This is often temporary - re-run the workflow

### Workflow Status Checks

The following checks must pass for PRs:
- ✅ **Quality** - All code quality checks pass
- ✅ **Test** - Unit tests pass with adequate coverage  
- ✅ **E2E** - End-to-end tests pass
- ✅ **Build** - Production build succeeds
- ✅ **Security** - No critical vulnerabilities found

## 🎯 Advanced Configuration

### Codecov Integration
1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Copy the token to `CODECOV_TOKEN` secret
4. Coverage reports will appear on PRs

### Vercel Integration
1. Get your Vercel token from dashboard
2. Add `VERCEL_TOKEN` and `VERCEL_URL` secrets  
3. Workflow will wait for deployment and report status

### Lighthouse CI
1. Install Lighthouse CI GitHub app
2. Add `LHCI_GITHUB_APP_TOKEN` secret
3. Performance reports will appear on PRs

## 📊 Performance Monitoring

The workflow includes:
- **Bundle size analysis** - Tracks JavaScript bundle size changes
- **Lighthouse performance tests** - Measures Core Web Vitals
- **Test execution time** - Monitors test performance

Results are uploaded as artifacts and can be downloaded from the Actions tab.

## 🚨 Security Features

- **Dependency scanning** - Automated vulnerability detection
- **CodeQL analysis** - Static security analysis  
- **Audit checks** - npm/pnpm audit integration
- **Branch protection** - Requires status checks to pass

## 📈 Metrics & Reporting

Track your project health:
- **Test coverage trends** - Via Codecov integration
- **Build time monitoring** - Workflow execution time
- **Security alerts** - GitHub security advisories
- **Performance metrics** - Lighthouse CI reports

---

## 🎉 Ready to Go!

Once you've added the essential secrets, your GitHub Actions pipeline is ready to:
- ✅ Automatically test all pull requests
- ✅ Verify code quality and security
- ✅ Build and validate production releases
- ✅ Monitor performance and bundle size
- ✅ Send notifications on failures

The pipeline follows production best practices and will help maintain code quality as your team grows!
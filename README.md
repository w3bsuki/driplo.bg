# 👗 Driplo - Sustainable Fashion Marketplace

> A modern, production-ready SvelteKit marketplace for pre-loved fashion items built with Supabase, TypeScript, and Tailwind CSS.

[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen.svg)](https://driplo.bg)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-orange.svg)](https://svelte.dev)
[![SvelteKit 2](https://img.shields.io/badge/SvelteKit-2-orange.svg)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
- **pnpm** 9+ (package manager)
- **Supabase** account

### Installation
```bash
# Clone and install dependencies
git clone https://github.com/w3bsuki/driplo.bg.git
cd driplo.bg
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Setup database
pnpm run db:setup  # Run migrations and setup RLS

# Start development server
pnpm dev
```

## 📚 Documentation

### Essential Setup Guides
- **[Database Setup](FRESH_DB_SETUP.md)** - Complete Supabase database setup with migrations and RLS
- **[Email Configuration](SUPABASE_EMAIL_SETUP.md)** - Configure email notifications and authentication
- **[Development Guidelines](CLAUDE.md)** - Code standards, patterns, and development practices
- **[GitHub Actions Setup](docs/GITHUB_ACTIONS_SETUP.md)** - CI/CD pipeline configuration and secrets

### Current Project Status
- **[Refactor Execution Plan](PHASED_REFACTOR_EXECUTION_PLAN.md)** - Production readiness roadmap and progress ⭐
- **[Archive](docs/archive/)** - Historical documentation and reports

## 🏗️ Architecture

### Tech Stack
- **Frontend**: SvelteKit 2 + Svelte 5 (with runes)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Language**: TypeScript 5
- **Package Manager**: pnpm
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

### Key Features
- 🔐 **Authentication** - Supabase Auth with email verification
- 👤 **User Profiles** - Comprehensive buyer and seller profiles  
- 🛍️ **Listings** - Product listing creation and management
- 💳 **Payments** - Stripe integration for secure transactions
- 📧 **Email Notifications** - Order updates and communication
- 🔍 **Search & Filters** - Advanced product discovery
- 📱 **Mobile-First** - Fully responsive design
- 🌐 **Internationalization** - English and Bulgarian support

### Project Structure
```
src/
├── lib/
│   ├── components/     # Reusable Svelte components
│   ├── stores/         # Svelte 5 stores (.svelte.ts files)
│   ├── server/         # Server-side utilities and APIs
│   ├── utils/          # Shared utility functions
│   └── types/          # TypeScript type definitions
├── routes/             # SvelteKit file-based routing
│   ├── (app)/         # Main application routes
│   ├── (auth)/        # Authentication routes
│   ├── api/           # API endpoints
│   └── (category)/    # Category-specific routes
supabase/
├── migrations/        # Database migrations
└── config.toml       # Supabase configuration
```

## 🛠️ Development

### Available Scripts
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm check            # TypeScript type checking
pnpm lint             # ESLint code quality check
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests with Playwright
pnpm format           # Format code with Prettier
```

### Code Quality Standards
- **TypeScript**: Strict mode enabled with comprehensive type coverage
- **ESLint**: Extended configuration with Svelte-specific rules  
- **Prettier**: Consistent code formatting
- **Svelte 5**: Modern runes-based reactivity (no legacy syntax)
- **Testing**: Unit tests with Vitest + E2E tests with Playwright

### Key Development Rules
- ✅ Use **Svelte 5** event syntax (`onclick`, `oninput`) - never old syntax (`on:click`)
- ✅ Use **$lib/*** imports - never relative imports
- ✅ Use **environment variables** - never hardcoded URLs
- ✅ Follow **mobile-first** responsive design
- ✅ Implement proper **error handling** and loading states

## 🌍 Environment Configuration

### Required Environment Variables
```bash
# Supabase
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
PUBLIC_APP_URL=https://driplo.bg
PUBLIC_SUPPORT_EMAIL=support@driplo.bg

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Payments (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🚢 Deployment

### Production Checklist
- [x] All 4 refactor phases completed (see execution plan)
- [x] Database migrations applied and RLS enabled
- [x] Environment variables configured
- [x] Email notifications implemented  
- [x] TypeScript errors resolved
- [x] Production build tested
- [x] E2E tests passing
- [x] Security audit completed

### Deployment Platforms
- **Primary**: [Vercel](https://vercel.com) (recommended)
- **Database**: [Supabase](https://supabase.com)
- **Email**: [Resend](https://resend.com)
- **Payments**: [Stripe](https://stripe.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the development guidelines in `CLAUDE.md`
4. Ensure all tests pass: `pnpm test && pnpm test:e2e`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check the guides linked above
- **Issues**: [GitHub Issues](https://github.com/w3bsuki/driplo.bg/issues)
- **Email**: support@driplo.bg

---

Made with ❤️ for sustainable fashion by the Driplo team
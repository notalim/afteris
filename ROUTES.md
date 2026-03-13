# Afteris Route Map

## Onboarding Flow
- `/(onboarding)/step1-welcome` — Welcome screen with dev skip
- `/(onboarding)/step2-goals` — Goal selection (multi-select pills)
- `/(onboarding)/step3-protocol` — Protocol setup / compound selection
- `/(onboarding)/step4-notifications` — Reminder time selection
- `/(onboarding)/step5-personalize` — Name entry (personality removed)
- `/(onboarding)/step6-social` — Social proof / testimonials
- `/(onboarding)/step7-paywall` — Subscription paywall

## Main App (Tabs)
- `/(tabs)/` or `/(tabs)/index` — Dashboard (home)
- `/(tabs)/protocol` — Protocol manager (calendar + calculator + reference)
- `/(tabs)/hub` — Knowledge hub (articles, safety info)
- `/(tabs)/calendar` — Hidden (merged into protocol tab)

## Modals
- `/profile-modal` — Profile & settings (presented as iOS modal)

## Future Routes (Backend Needed)
- `/compound/[id]` — Compound detail view
- `/article/[slug]` — Full article view (currently inline modal)
- `/settings/notifications` — Notification preferences
- `/settings/subscription` — Manage subscription (RevenueCat)
- `/settings/health-connect` — Apple Health / Health Connect setup
- `/referral` — Referral program
- `/export` — Data export

## API Routes (Future Backend)
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `POST /api/sync` — Sync local SQLite to cloud
- `GET /api/compounds` — Fetch compound database
- `GET /api/articles` — Fetch articles
- `POST /api/referral/generate` — Generate referral code
- `POST /api/subscription/verify` — Verify IAP receipt

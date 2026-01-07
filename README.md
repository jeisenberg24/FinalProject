# Service Quote Calculator

A full-stack web application for generating accurate service quotes. Built with Next.js, Supabase, Stripe, and OpenAI.

## Features

- **Quote Calculation**: Multi-factor pricing algorithm considering market rates, complexity, emergency services, and more
- **User Authentication**: Google OAuth and email/password authentication via Supabase
- **Quote Management**: Save, view, and manage all your quotes
- **AI Recommendations**: OpenAI-powered pricing insights
- **Premium Features**: Stripe integration for subscription tiers
- **PDF Generation**: Generate and store quote PDFs

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Stripe
- **AI**: OpenAI API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- OpenAI API key (for AI features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Set up Supabase:
   ```bash
   npm install -g supabase
   supabase init
   supabase start
   ```

5. Run database migrations:
   ```bash
   supabase db reset
   ```

6. Deploy Edge Functions:
   ```bash
   supabase functions deploy calculate-quote
   supabase functions deploy ai-pricing-recommendation
   supabase functions deploy stripe-webhook
   supabase functions deploy generate-quote-pdf
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
FinalProject/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Dashboard page
│   ├── quote/              # Quote creation
│   ├── quotes/             # Quote listing and details
│   └── profile/            # User profile
├── components/             # React components
│   ├── ui/                 # UI components (shadcn/ui)
│   ├── QuoteForm.tsx       # Quote input form
│   └── QuoteDisplay.tsx    # Quote output display
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
│   └── calculations.ts     # Pricing algorithm
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── functions/         # Edge functions
└── types/                  # TypeScript type definitions
```

## Database Schema

- **profiles**: User profiles extending auth.users
- **quotes**: Service quotes with pricing details
- **subscriptions**: Stripe subscription management
- **quote_history**: Quote activity tracking

## Pricing Algorithm

The calculator uses a multi-factor pricing model:

1. Base Price (Market Rate)
2. Market Demand Adjustment (±15% to -10%)
3. Complexity Adjustment (-10% to +20%)
4. Emergency Premium (+50% base, +25% after hours)
5. Travel Cost (distance × rate)
6. Seasonal Adjustment (±15% to -10%)
7. Experience Level Adjustment (-5% to +10%)
8. Equipment Costs
9. Competitor Pricing Consideration

## Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Configure environment variables in Vercel
4. Deploy Supabase migrations to production
5. Deploy Edge Functions to production
6. Update OAuth redirect URIs
7. Configure Stripe webhook URLs

## License

MIT




# Custodian CRM

A modern Customer Relationship Management system built with React, TypeScript, and Supabase.

## Features

- **Customer Management** - Create, edit, and manage customer records
- **Lead Tracking** - Track sales leads and opportunities
- **Task Management** - Kanban board for task organization
- **Customer Portal** - Secure customer login and dashboard
- **Email Integration** - Automated welcome emails via EmailJS
- **Analytics Dashboard** - Charts and metrics for business insights
- **Theme Support** - Light and dark mode themes

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email Service**: EmailJS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd custodian-sync
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - Supabase URL and anon key
   - EmailJS service ID, template ID, and public key

5. Run database migrations:
```bash
npx supabase db push
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API and external service integrations
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── integrations/       # Third-party integrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.
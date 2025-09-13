# Custodian CRM - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Installation & Setup](#installation--setup)
3. [Environment Configuration](#environment-configuration)
4. [Email System](#email-system)
5. [Customer Authentication](#customer-authentication)
6. [Deployment Guide](#deployment-guide)
7. [SPA Routing Configuration](#spa-routing-configuration)
8. [Project Optimization](#project-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)
11. [License](#license)

---

## Project Overview

A modern Customer Relationship Management system built with React, TypeScript, and Supabase.

### Features

- **Customer Management** - Create, edit, and manage customer records
- **Lead Tracking** - Track sales leads and opportunities
- **Task Management** - Kanban board for task organization
- **Customer Portal** - Secure customer login and dashboard
- **Email Integration** - Automated welcome emails via EmailJS
- **Analytics Dashboard** - Charts and metrics for business insights
- **Theme Support** - Light and dark mode themes

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite 4.5.x
- **UI Framework**: Tailwind CSS + Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email Service**: EmailJS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API and external service integrations
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── config/             # Configuration files
└── integrations/       # Third-party integrations
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Quick Setup

1. **Clone the repository:**
```bash
git clone https://github.com/AdharshKokkula/CRM-Pro
cd CRM-Pro
```

2. **Install dependencies:**
```bash
npm install
```

3. **Database Setup**
Run this SQL in your Supabase SQL editor:
```sql
-- Add email tracking columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT TRUE;
```

4. **Environment Configuration**
Create `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Email Settings
VITE_FROM_EMAIL=your_email@domain.com
VITE_FROM_NAME=Your Company Name

# App URL
VITE_APP_URL=http://localhost:8080
```

5. **Start Development**
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run verify` - Verify build output
- `npm run setup-vercel` - Show Vercel environment variables

---

## Environment Configuration

### Development vs Production

#### Development (.env)
```bash
VITE_APP_URL="http://localhost:8080"
# ... other config
```

#### Production (.env.production)
```bash
VITE_APP_URL="https://crm-pro-eta.vercel.app"
# ... other config
```

### Centralized Configuration

The project uses `src/config/environment.ts`:

```typescript
export const config = {
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
```

---

## Email System

### Overview

The email system uses EmailJS to send automated welcome emails to customers with portal access links.

### Configuration

#### EmailJS Setup
1. Create EmailJS account
2. Set up email service (Gmail, Outlook, etc.)
3. Create email template
4. Get service ID, template ID, and public key

#### Environment Variables
```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=Your Company Name
```

### Email Flow

1. **Trigger**: Customer creation with "Send welcome email" checked
2. **Generation**: Email with portal access link
3. **Delivery**: Via EmailJS to customer's inbox
4. **Logging**: Success/failure tracked in database
5. **Portal Access**: Customer clicks link → login page

### Testing

#### Development Testing
```javascript
// In browser console
EmailTestUtils.logConfigurationStatus();
EmailTestUtils.sendTestEmail('your-email@example.com');
```

#### Production Testing
1. Create customer with real email
2. Check "Send welcome email"
3. Verify email delivery
4. Test portal link functionality

---

## Customer Authentication

### Authentication Flow

#### Simplified Process
1. **Email Link**: Customer receives "Access Portal" email
2. **Login Page**: Pre-filled email, password creation option
3. **Password Setup**: Inline password creation (no separate page)
4. **Account Creation**: Direct Supabase auth signup
5. **Portal Access**: Immediate login after password creation

### Key Features

- **No RLS Conflicts**: Eliminated customer table queries during auth
- **Automatic Detection**: System detects if password setup is needed
- **Clean UX**: Single-page password creation
- **Secure**: Uses Supabase's built-in authentication

### Security

- Supabase auth validation for email verification
- 8+ character password requirement
- Standard auth flow with built-in security
- No sensitive data exposure during authentication

---

## Deployment Guide

### Vercel Deployment

#### Build Configuration

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install --legacy-peer-deps",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Environment Variables Setup

Run `npm run setup-vercel` to get the exact variables for Vercel dashboard:

```bash
VITE_APP_URL=https://crm-pro-eta.vercel.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_FROM_EMAIL=your_email@domain.com
VITE_FROM_NAME=Your Company Name
```

#### Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Push to GitHub** - Vercel auto-deploys
3. **Verify Build** - Check deployment logs
4. **Test Features** - Confirm all functionality works

### Build Performance

- **Build Time**: ~6 seconds
- **Bundle Size**: 
  - Vendor: 141KB (45KB gzipped)
  - UI: 42KB (14KB gzipped)
  - Main: 471KB (130KB gzipped)
  - CSS: 50KB (9KB gzipped)

---

## SPA Routing Configuration

### Issue & Solution

**Problem**: Direct links to `/customer-portal/login` showed 404 errors

**Solution**: Added SPA routing configuration for Vercel

#### Vercel Rewrites
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

#### Fallback Configuration
**File**: `public/_redirects`
```
/*    /index.html   200
```

### How It Works

1. User clicks: `https://crm-pro-eta.vercel.app/customer-portal/login`
2. Vercel rewrites to: `/index.html`
3. React app loads → React Router handles routing
4. ✅ CustomerLogin component renders

---

## Project Optimization

### Dependencies Optimization

#### Removed (27 packages):
- Unused Radix UI components
- Form libraries (react-hook-form, zod)
- Date utilities (initially removed, then re-added date-fns)
- Carousel components
- Development tools (lovable-tagger)

#### Kept Essential (27 packages):
- Core React ecosystem
- Essential Radix UI components
- Supabase integration
- EmailJS integration
- Recharts for analytics
- Theme management

### Performance Benefits

- **52% fewer dependencies**
- **Faster npm install times**
- **Smaller bundle size**
- **Reduced build times**
- **Cleaner dependency tree**

### Build Optimization

- **Chunk Splitting**: Vendor, UI, and main chunks
- **ESBuild Minification**: Faster builds
- **Tree Shaking**: Unused code elimination
- **Gzip Compression**: Optimized delivery

---

## Troubleshooting

### Common Issues

#### Email Not Sending
**Symptoms**: Email service shows "not configured" error
**Solution**: 
1. Check `.env` file has all `VITE_EMAILJS_*` variables
2. Verify EmailJS service is active
3. Run `EmailTestUtils.logConfigurationStatus()`

#### Customer Portal 404 Error
**Symptoms**: Direct links show "NOT_FOUND" error
**Solution**: 
1. Ensure `vercel.json` has rewrites configuration
2. Check `public/_redirects` file exists
3. Verify React routes in `App.tsx`

#### Build Failures on Vercel
**Symptoms**: Rollup dependency errors
**Solution**:
1. Use Vite 4.5.x (stable version)
2. Install with `--legacy-peer-deps`
3. Ensure all dependencies are properly listed

#### Authentication Issues
**Symptoms**: RLS policy errors during login
**Solution**:
1. Customer auth doesn't query customers table
2. Uses direct Supabase auth signup
3. No RLS conflicts

### Debugging Tools

#### Email System
```javascript
// Check email configuration
EmailTestUtils.logConfigurationStatus();

// Send test email
EmailTestUtils.sendTestEmail('test@example.com');

// Check database logs
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

#### Build Verification
```bash
# Verify build output
npm run verify

# Check environment variables
npm run setup-vercel
```

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** following project conventions
4. **Test thoroughly**:
   - Run `npm run build`
   - Run `npm run lint`
   - Test email functionality
   - Test customer portal
5. **Submit pull request**

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Tailwind CSS**: Utility-first styling
- **Component Structure**: Reusable, well-documented components

### Testing Guidelines

- Test all CRUD operations
- Verify email functionality
- Test authentication flows
- Check responsive design
- Validate accessibility

---

## License

This project is private and proprietary.

---

## Quick Reference

### Live Application
🌐 **Production**: https://crm-pro-eta.vercel.app

### Key Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run verify       # Verify build output
npm run setup-vercel # Show Vercel env vars
```

### Support
For technical issues or questions, refer to the troubleshooting section above or check the project's issue tracker.

---

*Last updated: January 2025*
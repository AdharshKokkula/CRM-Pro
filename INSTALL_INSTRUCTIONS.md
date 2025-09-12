# Installation Instructions

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Run this SQL in your Supabase SQL editor:
```sql
-- Add email tracking columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT TRUE;
```

### 3. Environment Configuration
Create `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Email Configuration
Update `/src/config/email.ts` with your EmailJS credentials:
```typescript
export const emailConfig = {
  emailjs: {
    serviceId: 'your_service_id',
    templateId: 'your_template_id', 
    publicKey: 'your_public_key'
  }
};
```

### 5. Start Development
```bash
npm run dev
```

## ✅ Features Ready to Use

- **Customer Management** - Create and manage customers
- **Email Integration** - Send welcome emails to customers  
- **Customer Portal** - Password creation and login
- **Lead Tracking** - Manage sales opportunities
- **Task Management** - Kanban board for tasks
- **Analytics Dashboard** - View metrics and charts
- **Theme Support** - Light/dark mode toggle

## 🔧 Production Build
```bash
npm run build
npm run preview
```

The optimized project is now ready for development and production use!
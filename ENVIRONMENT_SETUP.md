# Environment Configuration Guide

## 🌍 Environment Setup

Your project is now configured to work seamlessly between development and production environments.

## 📁 Environment Files

### Development (.env)
```bash
# Development App URL
VITE_APP_URL="https://crm-pro-eta.vercel.app"

# Supabase Configuration
VITE_SUPABASE_URL="https://zphspfrxugumrgyaorbe.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID="service_y0ncxpl"
VITE_EMAILJS_TEMPLATE_ID="template_ge8njj8"
VITE_EMAILJS_PUBLIC_KEY="os-fpYqMntnwRSg3w"
```

### Production (.env.production)
```bash
# Production App URL
VITE_APP_URL="https://crm-pro-eta.vercel.app"

# Same Supabase and EmailJS config as development
```

## 🔧 Configuration Usage

The project uses `src/config/environment.ts` for centralized configuration:

```typescript
export const config = {
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
  // ... other configs
}
```

## 🚀 Deployment Process

### Vercel Environment Variables
Set these in your Vercel dashboard (Settings → Environment Variables):

1. `VITE_APP_URL` = `https://crm-pro-eta.vercel.app`
2. `VITE_SUPABASE_URL` = `https://zphspfrxugumrgyaorbe.supabase.co`
3. `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
4. `VITE_EMAILJS_SERVICE_ID` = `service_y0ncxpl`
5. `VITE_EMAILJS_TEMPLATE_ID` = `template_ge8njj8`
6. `VITE_EMAILJS_PUBLIC_KEY` = `os-fpYqMntnwRSg3w`
7. `VITE_FROM_EMAIL` = `kokkulaasharsh17@gmail.com`
8. `VITE_FROM_NAME` = `CRM`

## ✅ What's Already Configured

- ✅ **Email Service**: Uses environment-specific URLs for portal links
- ✅ **Supabase**: Already uses cloud database (no localhost)
- ✅ **EmailJS**: Already uses cloud service (no localhost)
- ✅ **Build Process**: Automatically uses correct environment

## 🧪 Testing

### Development
```bash
npm run dev
# App runs on http://localhost:8080
# Email links point to http://localhost:8080
```

### Production
```bash
npm run build
npm run preview
# Email links point to https://crm-pro-eta.vercel.app
```

## 🔍 Verification Steps

1. **Check Environment Loading**:
   - Open browser console
   - Check `import.meta.env.VITE_APP_URL`

2. **Test Email Links**:
   - Create a customer
   - Send welcome email
   - Verify email contains correct URL

3. **Test Portal Access**:
   - Click email link
   - Should redirect to correct environment

## 🎯 No Changes Needed

Your project architecture is already production-ready:
- Uses Supabase (cloud database)
- Uses EmailJS (cloud email service)
- No hardcoded localhost URLs found
- Environment variables properly configured

The deployed app at https://crm-pro-eta.vercel.app should work immediately!
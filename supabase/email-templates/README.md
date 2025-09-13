# Supabase Email Templates Configuration

## Setup Instructions

1. **Access Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/zphspfrxugumrgyaorbe
   - Navigate to **Authentication** → **Settings** → **Email Templates**

2. **Configure Email Templates**
   - Select **Confirm signup** template
   - Copy the HTML from `confirm-signup.html`
   - Paste into the template editor
   - Save changes

## Template Variables

Supabase provides these variables for email templates:

- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Token }}` - Confirmation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation

## Email Settings

Configure in Supabase Dashboard → Authentication → Settings:

- **Site URL**: `https://crm-pro-eta.vercel.app`
- **Redirect URLs**: 
  - `https://crm-pro-eta.vercel.app/auth/callback`
  - `http://localhost:8080/auth/callback` (for development)

## SMTP Configuration (Optional)

For custom SMTP instead of Supabase's default:
1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure your email provider (Gmail, SendGrid, etc.)
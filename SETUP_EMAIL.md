# Email Service Setup Guide

## 🚀 Quick Setup (EmailJS - Free Tier)

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Create a new email service (Gmail, Outlook, etc.)
4. Create an email template

### 2. Configure Environment Variables
Create a `.env` file in your project root:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx  
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Email Settings
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=Your Company Name
```

### 3. EmailJS Template Setup
Create a template with these variables:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Recipient name
- `{{subject}}` - Email subject
- `{{message}}` - Email content
- `{{login_link}}` - Portal login link

### 4. Test Email Configuration
```typescript
// Test in browser console
import { EmailService } from './src/services/emailService';

EmailService.sendWelcomeEmail({
  id: 'test-id',
  name: 'Test User',
  email: 'test@example.com'
});
```

## 🔧 Production Setup Options

### Option 1: SendGrid
```env
VITE_EMAIL_PROVIDER=sendgrid
VITE_SENDGRID_API_KEY=your_api_key
VITE_FROM_EMAIL=noreply@yourdomain.com
```

### Option 2: Mailgun
```env
VITE_EMAIL_PROVIDER=mailgun
VITE_MAILGUN_API_KEY=your_api_key
VITE_MAILGUN_DOMAIN=your_domain
```

## 📧 Email Flow Process

### 1. Trigger Event
```
Customer Creation → CustomerForm.tsx → EmailService.sendWelcomeEmail()
```

### 2. Email Processing
```
EmailService → Configuration Check → EmailJS/SendGrid API → Delivery
```

### 3. Logging & Tracking
```
Email Attempt → Database Log → UI Status Update → Admin Dashboard
```

## 🧪 Testing Guide

### Development Testing
1. **Console Logs**: Check browser console for email sending logs
2. **Database Check**: Verify `email_logs` table entries
3. **UI Status**: Check email status badges in customer list

### Production Testing
1. **Real Email Test**: Send to actual email address
2. **Delivery Confirmation**: Check email provider dashboard
3. **Error Monitoring**: Monitor error logs and retry attempts

## 🐛 Debugging Common Issues

### Issue: "Email service not configured"
**Solution**: Check environment variables are set correctly

### Issue: "Failed to send email"
**Solutions**:
- Verify EmailJS service is active
- Check API keys are valid
- Ensure template exists and is published
- Check network connectivity

### Issue: "Email sent but not received"
**Solutions**:
- Check spam/junk folder
- Verify email service quotas
- Check email provider logs
- Validate recipient email address

## 📊 Monitoring & Analytics

### Email Dashboard Features
- Total emails sent/failed
- Success rate percentage
- Recent email activity log
- Error message tracking

### Key Metrics to Monitor
- **Delivery Rate**: % of emails successfully sent
- **Error Patterns**: Common failure reasons
- **Response Time**: Email sending performance
- **Retry Success**: Effectiveness of retry logic

## 🔒 Security Best Practices

### Environment Variables
- Never commit API keys to version control
- Use different keys for dev/staging/production
- Rotate keys regularly

### Email Content
- Sanitize user input in email templates
- Use HTTPS for all login links
- Implement rate limiting for email sending

### Error Handling
- Don't expose sensitive error details to users
- Log detailed errors for debugging
- Implement graceful fallbacks

## 📈 Performance Optimization

### Retry Logic
- Exponential backoff for failed attempts
- Maximum retry limits
- Circuit breaker pattern for service failures

### Rate Limiting
- Respect email service quotas
- Implement queue for bulk emails
- Monitor sending velocity

### Caching
- Cache email templates
- Reuse service connections
- Optimize database queries for logging
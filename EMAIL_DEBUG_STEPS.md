# 🐛 Email Status Debug Guide

## 🔍 **Root Cause Analysis**

The "Not Sent" status issue is likely caused by one of these problems:

1. **Database Structure**: Missing email tracking columns
2. **Email Service Configuration**: EmailJS not properly configured
3. **Database Update Failure**: Customer record not being updated
4. **UI Refresh Issue**: Status not refreshing after email send

## 🛠️ **Step-by-Step Fix Process**

### **Step 1: Database Setup**
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Run the SQL script from `DATABASE_SETUP.sql` file
3. Verify the tables are created correctly

### **Step 2: Test Email Configuration**
1. Open your app and go to **Analytics → Email Analytics**
2. Use the **Email Configuration Test** component
3. Check browser console for configuration status
4. Send a test email to verify EmailJS is working

### **Step 3: Debug Email Sending**
1. Create a new customer with "Send welcome email" checked
2. Open browser **Developer Tools → Console**
3. Look for these log messages:
   ```
   🚀 Starting sendWelcomeEmail for: {customer data}
   ✅ Email service is configured
   📧 Sending welcome email to: email@example.com
   📋 Email params: {params}
   📬 Email send result: true/false
   ✅ Email sent successfully, updating database...
   📝 Email log entry created
   ✅ Customer record updated with email status
   ```

### **Step 4: Check Database Updates**
1. Go to **Supabase Dashboard → Table Editor**
2. Check the `customers` table for your new customer
3. Verify these columns have correct values:
   - `welcome_email_sent`: should be `true`
   - `welcome_email_sent_at`: should have timestamp
4. Check the `email_logs` table for log entries

### **Step 5: Force UI Refresh**
1. After creating a customer, manually refresh the page
2. Check if the email status updates correctly
3. Try using the resend email button

## 🧪 **Testing Commands**

### **Browser Console Tests:**
```javascript
// Check email configuration
EmailTestUtils.logConfigurationStatus();

// Test email sending
EmailTestUtils.sendTestEmail('your-email@example.com');

// Check if customer has email status
// (Replace 'customer-id' with actual ID)
supabase.from('customers').select('*').eq('id', 'customer-id').single();
```

### **Database Queries:**
```sql
-- Check customers with email status
SELECT name, email, welcome_email_sent, welcome_email_sent_at 
FROM customers 
WHERE welcome_email_sent = true;

-- Check email logs
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;

-- Check specific customer
SELECT * FROM customers WHERE email = 'customer@example.com';
```

## 🔧 **Common Issues & Solutions**

### **Issue 1: "Email service not configured"**
**Solution:**
1. Check `.env` file has all EmailJS variables
2. Restart development server
3. Verify EmailJS dashboard shows active service

### **Issue 2: "Email sent but status shows Not Sent"**
**Solution:**
1. Run the `DATABASE_SETUP.sql` script
2. Check browser console for database update errors
3. Verify RLS policies allow updates

### **Issue 3: "Database update failed"**
**Solution:**
1. Check Supabase logs for RLS policy errors
2. Verify customer `owner_id` matches current user
3. Check if columns exist in customers table

### **Issue 4: "UI not refreshing"**
**Solution:**
1. Check if `onEmailSent` callback is being called
2. Verify `fetchCustomers()` is refreshing data
3. Try manual page refresh

## 📊 **Expected Behavior**

### **Successful Email Flow:**
1. User creates customer with email checkbox checked
2. Console shows email sending progress
3. EmailJS sends actual email
4. Database logs the attempt as 'sent'
5. Customer record updates with email status
6. UI shows "Sent" badge with timestamp
7. Customer receives email in inbox

### **Failed Email Flow:**
1. User creates customer with email checkbox checked
2. Console shows configuration or sending error
3. Database logs the attempt as 'failed'
4. Customer record remains with email status false
5. UI shows "Not Sent" badge
6. User can click resend button to retry

## 🎯 **Success Verification**

✅ **Database Setup**: Tables exist with correct columns  
✅ **Email Configuration**: EmailJS properly configured  
✅ **Email Sending**: Console shows successful send  
✅ **Database Logging**: email_logs table has entries  
✅ **Customer Update**: welcome_email_sent = true  
✅ **UI Display**: Shows "Sent" badge with timestamp  
✅ **Email Delivery**: Customer receives actual email  

Follow these steps in order and check each one before moving to the next. The detailed console logging will help identify exactly where the process is failing.
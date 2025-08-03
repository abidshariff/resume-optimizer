# 🔔 Stripe Webhook Events for JobTailorAI Pro

## **Critical Events (Must Handle)**

### **1. customer.subscription.created**
**When:** User completes signup and subscription is created
**What to do:**
- Save subscription details to database
- Link subscription to user account
- Send welcome email
- Enable Pro features

```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "status": "trialing",
      "trial_end": 1640995200,
      "current_period_end": 1643673600
    }
  }
}
```

### **2. customer.subscription.updated**
**When:** Subscription status changes (trial ends, becomes active, etc.)
**What to do:**
- Update subscription status in database
- Enable/disable Pro features accordingly
- Handle trial-to-paid transitions

### **3. customer.subscription.deleted**
**When:** User cancels subscription
**What to do:**
- Update database to show canceled status
- Disable Pro features (at period end)
- Send cancellation confirmation

### **4. invoice.payment_succeeded**
**When:** Monthly payment processes successfully
**What to do:**
- Update payment status
- Extend subscription period
- Send receipt email

### **5. invoice.payment_failed**
**When:** Monthly payment fails
**What to do:**
- Mark payment as failed
- Send payment failure notification
- Start dunning process (retry payments)

## **Important Events (Should Handle)**

### **6. checkout.session.completed**
**When:** User completes Stripe Checkout
**What to do:**
- Link checkout session to user
- Prepare for subscription creation
- Track conversion metrics

### **7. customer.created**
**When:** New customer record created in Stripe
**What to do:**
- Link Stripe customer to your user account
- Store customer ID for future reference

## **Optional Events (Nice to Have)**

### **8. invoice.created**
**When:** New invoice generated
**What to do:**
- Send invoice notification
- Update billing history

### **9. customer.subscription.trial_will_end**
**When:** Trial ending in 3 days
**What to do:**
- Send trial ending reminder
- Encourage conversion

## **Event Processing Flow**

```
Stripe Event → Your Webhook Endpoint → Process Event → Update Database → Update User Experience
```

## **Database Changes Needed**

### **New Tables Required:**
```sql
-- Customers table
CREATE TABLE customers (
    user_id VARCHAR PRIMARY KEY,
    stripe_customer_id VARCHAR UNIQUE,
    email VARCHAR,
    created_at TIMESTAMP
);

-- Subscriptions table  
CREATE TABLE subscriptions (
    user_id VARCHAR PRIMARY KEY,
    subscription_id VARCHAR UNIQUE,
    customer_id VARCHAR,
    status VARCHAR, -- trialing, active, canceled, etc.
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## **What Happens Without Webhooks**

### **Problems You'll Face:**
1. **User cancels in Stripe** → Still has Pro access in your app
2. **Payment fails** → User keeps Pro features without paying
3. **Trial ends** → No automatic conversion tracking
4. **Refund issued** → User still has Pro access
5. **No subscription analytics** → Can't track churn, revenue, etc.

### **Manual Workarounds (Not Recommended):**
- Daily sync jobs to check Stripe API
- Manual database updates
- Customer service handling all issues
- No real-time subscription management

## **Benefits of Proper Webhook Implementation**

### **For Your Business:**
- ✅ Accurate revenue tracking
- ✅ Proper subscription lifecycle management
- ✅ Automated customer communications
- ✅ Reduced customer service burden
- ✅ Better analytics and reporting

### **For Your Customers:**
- ✅ Immediate access after payment
- ✅ Proper access removal after cancellation
- ✅ Clear billing communications
- ✅ Seamless subscription management

## **Implementation Priority**

### **Phase 1 (Critical - Do First):**
1. customer.subscription.created
2. customer.subscription.updated  
3. customer.subscription.deleted
4. invoice.payment_failed

### **Phase 2 (Important - Do Soon):**
5. invoice.payment_succeeded
6. checkout.session.completed

### **Phase 3 (Nice to Have - Do Later):**
7. customer.created
8. invoice.created
9. customer.subscription.trial_will_end

## **Testing Webhooks**

### **Stripe CLI for Local Testing:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/webhook

# Trigger test events
stripe trigger customer.subscription.created
```

### **Production Testing:**
1. Use Stripe Dashboard webhook testing
2. Create test subscriptions
3. Monitor webhook delivery logs
4. Verify database updates

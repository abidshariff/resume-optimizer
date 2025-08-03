# 🔐 Stripe Production Setup Guide

## **Step 1: Activate Live Mode in Stripe**

### **1.1: Complete Business Verification**
1. Go to https://dashboard.stripe.com
2. Click **"Activate your account"** banner
3. Complete business information:
   - Business type (Individual/Company)
   - Tax ID (SSN or EIN)
   - Bank account details
   - Identity verification

### **1.2: Switch to Live Mode**
1. Toggle from **"Test"** to **"Live"** in top-left
2. You'll see live dashboard (no test data)

## **Step 2: Create Live Product & Price**

### **2.1: Create JobTailorAI Pro Product (Live)**
1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name:** JobTailorAI Pro
   - **Description:** Unlimited resume optimization with premium features
   - **Pricing Model:** Recurring
   - **Price:** $9.99 USD
   - **Billing Period:** Monthly
   - **Free Trial:** 7 days
3. **Save product**
4. **Copy the Live Price ID** (starts with `price_`)

## **Step 3: Get Live API Keys**

### **3.1: Get Live Keys**
1. Go to **Developers** → **API Keys**
2. **Copy these keys:**

**Live Publishable Key:**
```
pk_live_51234567890abcdef...
```

**Live Secret Key:**
```
sk_live_51234567890abcdef...
```

⚠️ **IMPORTANT:** Keep secret key secure - never commit to git!

## **Step 4: Update Production Environment**

### **4.1: Update .env.production**
Replace these lines in `frontend/.env.production`:

```bash
# BEFORE (placeholder)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
REACT_APP_STRIPE_PRICE_ID=price_YOUR_LIVE_PRICE_ID_HERE

# AFTER (your actual keys)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_LIVE_KEY
REACT_APP_STRIPE_PRICE_ID=price_YOUR_ACTUAL_LIVE_PRICE_ID
```

## **Step 5: Test Payment Flow**

### **5.1: Test with Live Keys (Locally First)**
1. Update your development `.env` with live keys temporarily
2. Test the payment flow
3. Use real card details (will charge real money!)
4. Cancel subscription immediately after testing

### **5.2: Live Test Cards (No Charges)**
For testing without charges, use these in live mode:
- **Success:** `4000 0000 0000 0077` (requires authentication)
- **Declined:** `4000 0000 0000 0002`

## **Step 6: Production Deployment Checklist**

### **Before Deploying:**
- [ ] Business verification completed in Stripe
- [ ] Live product created with correct pricing
- [ ] Live API keys obtained and secured
- [ ] Production environment file updated
- [ ] Payment flow tested locally with live keys
- [ ] Terms of service and privacy policy updated
- [ ] Customer support email configured

### **After Deploying:**
- [ ] Test live payment flow on production site
- [ ] Set up Stripe webhooks (next phase)
- [ ] Configure subscription management
- [ ] Set up monitoring and alerts
- [ ] Test cancellation and refund process

## **Step 7: Go Live Safely**

### **7.1: Soft Launch Strategy**
1. **Deploy with live keys**
2. **Test with small group** (friends/beta users)
3. **Monitor for issues** (24-48 hours)
4. **Full public launch** once stable

### **7.2: Monitoring Setup**
- Stripe Dashboard alerts
- AWS CloudWatch monitoring
- Error tracking (Sentry/Bugsnag)
- Revenue tracking spreadsheet

## **🚨 Security Checklist**

### **Environment Variables:**
- [ ] Live secret keys never in code
- [ ] Production environment properly configured
- [ ] Test mode disabled in production
- [ ] Console logging disabled

### **Stripe Security:**
- [ ] Webhook endpoints secured
- [ ] API keys rotated regularly
- [ ] Access logs monitored
- [ ] PCI compliance maintained

## **📞 Support & Resources**

### **If Issues Arise:**
1. **Stripe Support:** https://support.stripe.com
2. **AWS Support:** AWS Console → Support
3. **Documentation:** https://stripe.com/docs

### **Useful Stripe Features:**
- **Radar (Fraud Prevention):** Automatically enabled
- **Billing Portal:** Customer self-service
- **Invoicing:** Automatic invoice generation
- **Analytics:** Revenue and churn metrics

## **🎉 You're Ready for Production!**

Once you complete these steps, your JobTailorAI Pro will be ready to accept real payments and generate revenue!

**Next Phase:** Backend webhook setup for subscription management

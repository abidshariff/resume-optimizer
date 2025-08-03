# Stripe API Keys (Test Mode)

## From Stripe Dashboard → Developers → API Keys:

**Publishable Key (starts with pk_test_):**
```
pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**Secret Key (starts with sk_test_):**
```
sk_test_YOUR_SECRET_KEY_HERE
```

## Instructions:
1. Copy your actual keys from Stripe Dashboard
2. Replace the placeholder values in frontend/.env
3. Keep secret key secure - never commit to git
4. These are TEST keys - safe to use for development

## Next Steps:
- Create a product in Stripe Dashboard
- Get the Price ID
- Set up webhook endpoint

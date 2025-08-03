# Update Your .env File

Replace these lines in `/Volumes/workplace/resume-optimizer/frontend/.env`:

## BEFORE (current):
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
REACT_APP_STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
```

## AFTER (replace with your actual keys):
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_FROM_STRIPE_DASHBOARD
REACT_APP_STRIPE_PRICE_ID=price_YOUR_ACTUAL_PRICE_ID_FROM_STRIPE_DASHBOARD
```

## Example (don't use these - they're fake):
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
REACT_APP_STRIPE_PRICE_ID=price_1234567890abcdefghijklmn
```

## After updating:
1. Save the file
2. Restart your dev server (Ctrl+C, then npm start)
3. Test again - you should see real Stripe checkout!

# Environment Variables Setup Guide

## Overview
Your Supabase credentials are now securely stored in environment variables instead of being hardcoded in the source code.

## Files Created

### 1. `.env` (Your actual credentials - DO NOT COMMIT)
Contains your real Supabase credentials:
```
SUPABASE_URL=https://bwrmrbegjiunfitaemvz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. `.env.example` (Template file - Safe to commit)
A template showing what variables are needed:
```
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. `app.config.js` (Expo configuration)
Reads environment variables and makes them available to your app through `expo-constants`.

### 4. Updated `.gitignore`
Now includes `.env` to prevent accidentally committing your credentials to Git.

## How It Works

1. **Environment Variables** → Stored in `.env` file
2. **app.config.js** → Reads from `.env` using `process.env`
3. **expo-constants** → Accesses variables via `Constants.expoConfig.extra`
4. **supabaseClient.ts** → Uses credentials from Constants

## Usage in Code

```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey;
```

## Important Notes

### ✅ Security Best Practices
- `.env` is now in `.gitignore` - your credentials won't be committed to Git
- Only the `.env.example` template should be committed
- Never share your `.env` file or commit it to version control

### 🔄 After Changing .env
If you modify the `.env` file, you MUST restart the Expo development server:
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### 🚀 For Team Members
When other developers clone the repository:
1. Copy `.env.example` to `.env`
2. Fill in their own Supabase credentials
3. Run `npm start`

### 📱 For Production Builds
When building for production (EAS Build), you'll need to set environment variables in `eas.json` or through the EAS dashboard.

## Troubleshooting

### Error: "Supabase configuration missing!"
**Solution**:
1. Make sure `.env` file exists in the project root
2. Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
3. Restart Expo server (`npm start`)

### Variables are undefined
**Solution**:
1. Ensure `.env` file is at the project root (same level as `app.config.js`)
2. Restart the Expo development server
3. Clear cache: `npm start --clear`

### Changes to .env not reflecting
**Solution**:
- Always restart Expo after changing `.env` - hot reload doesn't pick up env variable changes

## Example .env File Structure

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Future: Add more environment variables as needed
# API_KEY=your-api-key
# STRIPE_PUBLIC_KEY=pk_test_...
```

## Next Steps

✅ Your credentials are now secure!
✅ Ready to use in development
✅ `.env` won't be committed to Git

For production deployment, refer to Expo's documentation on environment variables:
https://docs.expo.dev/guides/environment-variables/

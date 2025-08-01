# Twitter API Setup Guide

## Step 1: Configure Your App in X Developer Portal

### 1.1 Create Your App
1. Go to [X Developer Portal](https://developer.twitter.com/)
2. Click "Create App" or "Create Project"
3. Fill in the app details:
   - **App Name**: "Twitter Bot Cleaner"
   - **Description**: Use the description from `TWITTER_API_APPLICATION.md`
   - **Website URL**: `http://localhost:3000` (for development)

### 1.2 Configure OAuth 2.0 Settings
1. Go to "User authentication settings"
2. Enable OAuth 2.0
3. Set **App permissions** to "Read and write"
4. Add **Callback URLs**:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
5. Add **Website URL**: `http://localhost:3000`

### 1.3 Get Your API Keys
1. Go to "Keys and tokens" tab
2. Copy these values:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Bearer Token**
   - **OAuth 2.0 Client ID**
   - **OAuth 2.0 Client Secret**

## Step 2: Environment Configuration

### 2.1 Create Environment File
1. Copy `env.example` to `.env.local`
2. Fill in your API credentials:

```env
# Twitter API Configuration
REACT_APP_TWITTER_BEARER_TOKEN=your_bearer_token_here
REACT_APP_TWITTER_CLIENT_ID=your_oauth_client_id_here
REACT_APP_TWITTER_CLIENT_SECRET=your_oauth_client_secret_here
REACT_APP_TWITTER_API_KEY=your_api_key_here
REACT_APP_TWITTER_API_SECRET=your_api_secret_here
REACT_APP_TWITTER_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 2.2 Security Notes
- Never commit `.env.local` to version control
- Keep your API keys secure
- Use different keys for development and production

## Step 3: Update Your App

### 3.1 Switch to Real Twitter Service
Update your `App.tsx` to use the real Twitter service:

```typescript
import RealTwitterService from './services/realTwitterService';

// Replace the mock service with real service
const twitterService = RealTwitterService.getInstance();
```

### 3.2 Add OAuth Callback Handler
Create a callback component to handle OAuth:

```typescript
// src/components/AuthCallback.tsx
import { useEffect } from 'react';
import RealTwitterService from '../services/realTwitterService';

const AuthCallback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      RealTwitterService.getInstance().handleAuthCallback(code)
        .then(success => {
          if (success) {
            window.location.href = '/';
          }
        });
    }
  }, []);

  return <div>Processing authentication...</div>;
};
```

## Step 4: Test Your Integration

### 4.1 Start Development Server
```bash
npm start
```

### 4.2 Test Authentication
1. Click "Connect with Twitter"
2. Complete OAuth flow
3. Verify you can fetch followers

### 4.3 Test API Limits
- Check your rate limits in the Developer Portal
- Monitor API usage
- Implement proper error handling

## Step 5: Production Deployment

### 5.1 Update Environment Variables
For production, update your environment variables:
```env
REACT_APP_TWITTER_REDIRECT_URI=https://yourdomain.com/auth/callback
```

### 5.2 Build and Deploy
```bash
npm run build
```

### 5.3 Update OAuth Settings
In the Developer Portal, add your production callback URL.

## API Rate Limits

### Free Tier Limits
- **User lookup**: 300 requests per 15 minutes
- **Followers**: 15 requests per 15 minutes
- **Tweets**: 300 requests per 15 minutes

### Best Practices
1. **Implement caching** to reduce API calls
2. **Use pagination** for large follower lists
3. **Handle rate limits** gracefully
4. **Monitor usage** in Developer Portal

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure callback URLs are correct
2. **Rate limiting**: Implement proper delays between requests
3. **Authentication errors**: Check OAuth configuration
4. **Missing permissions**: Verify app permissions in Developer Portal

### Debug Tips
1. Check browser console for errors
2. Monitor Network tab for API calls
3. Verify environment variables are loaded
4. Test with small follower lists first

## Security Considerations

1. **Never expose API keys** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement proper error handling**
4. **Follow Twitter's Terms of Service**
5. **Respect user privacy** and data protection

## Next Steps

1. **Implement caching** for better performance
2. **Add error handling** for API failures
3. **Create user onboarding** flow
4. **Add analytics** to track usage
5. **Implement backup methods** (CSV import, etc.) 
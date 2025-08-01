// Simple OAuth 2.0 Twitter service
// This uses the user's OAuth 2.0 credentials to access their followers

export interface TwitterUser {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  createdAt: string;
  lastTweetDate?: string;
  description?: string;
  verified: boolean;
  protected: boolean;
}

export interface BotAnalysisResult {
  isBot: boolean;
  botScore: number;
  isInactive: boolean;
  reasons: string[];
}

export class OAuthTwitterService {
  private static instance: OAuthTwitterService;
  private bearerToken: string;
  private accessToken: string | null = null;

  private constructor() {
    this.bearerToken = process.env.REACT_APP_TWITTER_BEARER_TOKEN || '';
  }

  static getInstance(): OAuthTwitterService {
    if (!OAuthTwitterService.instance) {
      OAuthTwitterService.instance = new OAuthTwitterService();
    }
    return OAuthTwitterService.instance;
  }

  // Start OAuth 2.0 flow with PKCE
  async authenticateUser(): Promise<boolean> {
    const clientId = process.env.REACT_APP_TWITTER_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_TWITTER_REDIRECT_URI;
    
    console.log('OAuth Debug:', { clientId, redirectUri });
    
    if (!clientId || !redirectUri) {
      console.error('Missing OAuth credentials');
      return false;
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    
    // Generate state for security
    const state = Math.random().toString(36).substring(7);
    
    // Store PKCE and state for callback
    sessionStorage.setItem('twitter_oauth_state', state);
    sessionStorage.setItem('twitter_code_verifier', codeVerifier);
    
    // Build OAuth URL with PKCE
    const authUrl = `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=users.read&` +
      `state=${state}&` +
      `code_challenge_method=S256&` +
      `code_challenge=${codeChallenge}`;

    console.log('OAuth URL:', authUrl);
    console.log('Redirect URI being sent:', redirectUri);
    console.log('Client ID being sent:', clientId);

    // Redirect to Twitter OAuth
    window.location.href = authUrl;
    return true;
  }

  // Handle OAuth callback
  async handleAuthCallback(code: string, state: string): Promise<boolean> {
    try {
      const savedState = sessionStorage.getItem('twitter_oauth_state');
      if (state !== savedState) {
        throw new Error('State mismatch');
      }

      const tokenResponse = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: process.env.REACT_APP_TWITTER_REDIRECT_URI || '',
          code_verifier: sessionStorage.getItem('twitter_code_verifier') || ''
        })
      });

      console.log('Token response status:', tokenResponse.status);
      console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log('Token response:', tokenData);
        this.accessToken = tokenData.access_token;
        if (this.accessToken) {
          sessionStorage.setItem('twitter_access_token', this.accessToken);
        }
        sessionStorage.removeItem('twitter_oauth_state');
        sessionStorage.removeItem('twitter_code_verifier');
        return true;
      } else {
        const errorData = await tokenResponse.text();
        console.error('Token exchange failed:', tokenResponse.status, errorData);
        console.error('Request body sent:', {
          grant_type: 'authorization_code',
          client_id: process.env.REACT_APP_TWITTER_CLIENT_ID || '',
          client_secret: process.env.REACT_APP_TWITTER_CLIENT_SECRET || '',
          code,
          redirect_uri: process.env.REACT_APP_TWITTER_REDIRECT_URI || '',
          code_verifier: sessionStorage.getItem('twitter_code_verifier') || ''
        });
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
    return false;
  }

  // Get user's followers
  async getFollowers(maxResults: number = 1000): Promise<TwitterUser[]> {
    // Load access token from sessionStorage
    const accessToken = sessionStorage.getItem('twitter_access_token');
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      console.log('Debug - Access token exists:', !!accessToken);
      console.log('Debug - Access token length:', accessToken?.length);
      
      // Get current user ID first
      const userResponse = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '/users/me',
          accessToken
        })
      });

      console.log('Debug - User response status:', userResponse.status);

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('Debug - User API error:', errorText);
        throw new Error(`Failed to get current user: ${userResponse.status} ${errorText}`);
      }

      const userData = await userResponse.json();
      console.log('Debug - User data:', userData);
      const userId = userData.data.id;
      console.log('Debug - User ID:', userId);

      // Get followers
      const followersResponse = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/users/${userId}/followers?max_results=${Math.min(maxResults, 100)}&user.fields=created_at,description,public_metrics,verified,protected,profile_image_url`,
          accessToken
        })
      });

      console.log('Debug - Followers response status:', followersResponse.status);

      if (followersResponse.ok) {
        const data = await followersResponse.json();
        console.log('Debug - Followers data:', data);
        return (data.data || []).map((user: any) => ({
          id: user.id,
          username: user.username,
          displayName: user.name,
          profileImageUrl: user.profile_image_url || 'https://via.placeholder.com/48',
          followersCount: user.public_metrics?.followers_count || 0,
          followingCount: user.public_metrics?.following_count || 0,
          tweetCount: user.public_metrics?.tweet_count || 0,
          createdAt: user.created_at || '2020-01-01',
          description: user.description || '',
          verified: user.verified || false,
          protected: user.protected || false
        }));
      } else {
        const errorText = await followersResponse.text();
        console.error('Debug - Followers API error:', errorText);
        throw new Error(`Failed to get followers: ${followersResponse.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }

    // Fallback to mock data if API fails
    return this.getMockFollowers();
  }

  // Analyze user for bot detection
  analyzeUser(user: TwitterUser): BotAnalysisResult {
    const reasons: string[] = [];
    let botScore = 0;

    // Account age analysis
    const accountAge = this.getAccountAge(user.createdAt);
    if (accountAge < 30) {
      botScore += 0.2;
      reasons.push('New account (less than 30 days)');
    }

    // Follower/following ratio analysis
    const ratio = user.followingCount / Math.max(user.followersCount, 1);
    if (ratio > 10) {
      botScore += 0.3;
      reasons.push('Unusual following/follower ratio');
    } else if (ratio > 5) {
      botScore += 0.15;
      reasons.push('High following/follower ratio');
    }

    // Tweet frequency analysis
    if (user.tweetCount === 0) {
      botScore += 0.2;
      reasons.push('No tweets');
    } else if (user.tweetCount > 10000) {
      botScore += 0.15;
      reasons.push('Excessive tweet count');
    } else if (user.tweetCount < 5) {
      botScore += 0.1;
      reasons.push('Very few tweets');
    }

    // Profile completeness analysis
    if (!user.description || user.description.length < 10) {
      botScore += 0.1;
      reasons.push('Incomplete profile');
    }

    // Username pattern analysis
    if (this.hasBotLikeUsername(user.username)) {
      botScore += 0.2;
      reasons.push('Bot-like username pattern');
    }

    // Profile image analysis
    if (user.profileImageUrl.includes('default_profile') || 
        user.profileImageUrl.includes('placeholder')) {
      botScore += 0.1;
      reasons.push('Default profile image');
    }

    const isBot = botScore > 0.5;
    const isInactive = this.isInactive(user);

    return {
      isBot,
      botScore: Math.min(botScore, 1),
      isInactive,
      reasons
    };
  }

  // Helper methods
  private getAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  private isInactive(user: TwitterUser): boolean {
    if (!user.lastTweetDate) return true;
    const lastTweet = new Date(user.lastTweetDate);
    const now = new Date();
    const daysSinceLastTweet = Math.floor((now.getTime() - lastTweet.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastTweet > 180; // 6 months
  }

  private hasBotLikeUsername(username: string): boolean {
    const botPatterns = [
      /bot/i,
      /spam/i,
      /fake/i,
      /auto/i,
      /[0-9]{4,}/, // Many numbers
      /[a-z]{1,2}[0-9]{3,}/, // Short letters + many numbers
    ];
    
    return botPatterns.some(pattern => pattern.test(username));
  }

  private getMockFollowers(): TwitterUser[] {
    const followers: TwitterUser[] = [];
    
    for (let i = 0; i < 50; i++) {
      const isBot = Math.random() < 0.3;
      const isInactive = Math.random() < 0.2;
      
      followers.push({
        id: `user_${i}`,
        username: isBot ? `bot_account_${i}` : `user_${i}`,
        displayName: isBot ? `Bot Account ${i}` : `Real User ${i}`,
        profileImageUrl: 'https://via.placeholder.com/48',
        followersCount: isBot ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 1000),
        followingCount: isBot ? Math.floor(Math.random() * 5000) : Math.floor(Math.random() * 500),
        tweetCount: isBot ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 1000),
        createdAt: isBot ? '2023-01-01' : '2020-01-01',
        lastTweetDate: isInactive ? '2022-06-15' : '2024-01-15',
        description: isBot ? '' : 'Real person with real thoughts',
        verified: false,
        protected: false
      });
    }
    
    return followers;
  }

  // Generate PKCE code verifier
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Generate PKCE code challenge
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

export default OAuthTwitterService; 
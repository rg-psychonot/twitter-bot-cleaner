// Twitter API service for bot detection and follower management

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

export class TwitterService {
  private static instance: TwitterService;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService();
    }
    return TwitterService.instance;
  }

  // Simulate Twitter OAuth
  async connectToTwitter(): Promise<boolean> {
    // In a real implementation, this would redirect to Twitter OAuth
    return new Promise((resolve) => {
      setTimeout(() => {
        this.accessToken = 'mock_access_token';
        resolve(true);
      }, 1000);
    });
  }

  // Fetch user's followers
  async getFollowers(userId: string, maxResults: number = 1000): Promise<TwitterUser[]> {
    if (!this.accessToken) {
      throw new Error('Not connected to Twitter');
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFollowers: TwitterUser[] = this.generateMockFollowers(maxResults);
        resolve(mockFollowers);
      }, 2000);
    });
  }

  // Analyze a user for bot detection
  analyzeUser(user: TwitterUser): BotAnalysisResult {
    const reasons: string[] = [];
    let botScore = 0;

    // Check account age
    const accountAge = this.getAccountAge(user.createdAt);
    if (accountAge < 30) {
      botScore += 0.2;
      reasons.push('New account (less than 30 days)');
    }

    // Check follower/following ratio
    const ratio = user.followingCount / Math.max(user.followersCount, 1);
    if (ratio > 10) {
      botScore += 0.3;
      reasons.push('Unusual following/follower ratio');
    }

    // Check tweet frequency
    if (user.tweetCount === 0) {
      botScore += 0.2;
      reasons.push('No tweets');
    } else if (user.tweetCount > 10000) {
      botScore += 0.15;
      reasons.push('Excessive tweet count');
    }

    // Check last activity
    if (user.lastTweetDate) {
      const daysSinceLastTweet = this.getDaysSinceLastTweet(user.lastTweetDate);
      if (daysSinceLastTweet > 365) {
        botScore += 0.25;
        reasons.push('Inactive for over a year');
      }
    }

    // Check profile completeness
    if (!user.description || user.description.length < 10) {
      botScore += 0.1;
      reasons.push('Incomplete profile');
    }

    // Check for default profile image
    if (user.profileImageUrl.includes('default_profile')) {
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

  // Remove followers (unfollow)
  async removeFollowers(userIds: string[]): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not connected to Twitter');
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Removing ${userIds.length} followers...`);
        resolve(true);
      }, 1000);
    });
  }

  // Helper methods
  private getAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getDaysSinceLastTweet(lastTweetDate: string): number {
    const lastTweet = new Date(lastTweetDate);
    const now = new Date();
    return Math.floor((now.getTime() - lastTweet.getTime()) / (1000 * 60 * 60 * 24));
  }

  private isInactive(user: TwitterUser): boolean {
    if (!user.lastTweetDate) return true;
    const daysSinceLastTweet = this.getDaysSinceLastTweet(user.lastTweetDate);
    return daysSinceLastTweet > 180; // 6 months
  }

  private generateMockFollowers(count: number): TwitterUser[] {
    const followers: TwitterUser[] = [];
    
    for (let i = 0; i < count; i++) {
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
}

export default TwitterService; 
import React, { useState } from 'react';
import { Twitter, Users, Shield, Trash2, AlertTriangle, CheckCircle, Loader, Upload } from 'lucide-react';
import CSVImport from './CSVImport';
import OAuthTwitterService from '../services/oauthTwitterService';

interface Follower {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  createdAt: string;
  lastTweetDate?: string;
  isBot: boolean;
  isInactive: boolean;
  botScore: number;
}

const TwitterBotCleaner: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [selectedFollowers, setSelectedFollowers] = useState<Set<string>>(new Set());
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    bots: 0,
    inactive: 0,
    suspicious: 0
  });

  const twitterService = OAuthTwitterService.getInstance();

  const connectToTwitter = async () => {
    try {
      await twitterService.authenticateUser();
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to connect to Twitter. Please check your API credentials.');
    }
  };

  const analyzeFollowers = async () => {
    setIsAnalyzing(true);
    
    try {
      // Use the OAuth service to get real followers
      const rawFollowers = await twitterService.getFollowers();
      
      // Analyze each follower
      const analyzedFollowers: Follower[] = [];
      for (const follower of rawFollowers) {
        const analysis = twitterService.analyzeUser(follower);
        analyzedFollowers.push({
          ...follower,
          isBot: analysis.isBot,
          isInactive: analysis.isInactive,
          botScore: analysis.botScore
        });
      }

      setFollowers(analyzedFollowers);
      setStats({
        total: analyzedFollowers.length,
        bots: analyzedFollowers.filter(f => f.isBot).length,
        inactive: analyzedFollowers.filter(f => f.isInactive).length,
        suspicious: analyzedFollowers.filter(f => f.botScore > 0.7).length
      });
    } catch (error) {
      console.error('Error analyzing followers:', error);
      alert('Failed to fetch followers. Please check your API credentials and permissions.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCSVImport = (importedFollowers: any[]) => {
    const analyzedFollowers: Follower[] = importedFollowers.map(follower => {
      const analysis = twitterService.analyzeUser(follower);
      return {
        ...follower,
        isBot: analysis.isBot,
        isInactive: analysis.isInactive,
        botScore: analysis.botScore
      };
    });

    setFollowers(analyzedFollowers);
    setStats({
      total: analyzedFollowers.length,
      bots: analyzedFollowers.filter(f => f.isBot).length,
      inactive: analyzedFollowers.filter(f => f.isInactive).length,
      suspicious: analyzedFollowers.filter(f => f.botScore > 0.7).length
    });
    setShowCSVImport(false);
  };

  const toggleFollowerSelection = (followerId: string) => {
    const newSelected = new Set(selectedFollowers);
    if (newSelected.has(followerId)) {
      newSelected.delete(followerId);
    } else {
      newSelected.add(followerId);
    }
    setSelectedFollowers(newSelected);
  };

  const selectAllBots = () => {
    const botIds = followers.filter(f => f.isBot).map(f => f.id);
    setSelectedFollowers(new Set(botIds));
  };

  const selectAllInactive = () => {
    const inactiveIds = followers.filter(f => f.isInactive).map(f => f.id);
    setSelectedFollowers(new Set(inactiveIds));
  };

  const removeSelectedFollowers = () => {
    // Note: This app doesn't have follows.write permission, so we can only analyze
    alert(`Note: This app can only analyze followers. To remove followers, you would need to upgrade your app permissions to "Read and write and Direct message" in the X Developer Portal.`);
    setSelectedFollowers(new Set());
  };

  const getBotScoreColor = (score: number) => {
    if (score > 0.8) return 'text-red-600';
    if (score > 0.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Twitter className="h-8 w-8 text-twitter-blue mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Twitter Bot Cleaner</h1>
          </div>
          <p className="text-lg text-gray-600">
            Identify and remove bots and inactive accounts from your followers
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-twitter-blue mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-gray-600 mb-6">
                Choose how you'd like to import your follower data for analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={connectToTwitter}
                  className="bg-twitter-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Connect to Twitter
                </button>
                <button
                  onClick={() => setShowCSVImport(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Analysis Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Analyze Followers</h2>
                <button
                  onClick={analyzeFollowers}
                  disabled={isAnalyzing}
                  className="bg-twitter-blue hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>

              {stats.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Followers</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.bots}</div>
                    <div className="text-sm text-gray-600">Bots Detected</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
                    <div className="text-sm text-gray-600">Inactive Accounts</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.suspicious}</div>
                    <div className="text-sm text-gray-600">Suspicious</div>
                  </div>
                </div>
              )}
            </div>

            {/* Followers List */}
            {followers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Followers Analysis</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllBots}
                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                      >
                        Select All Bots
                      </button>
                      <button
                        onClick={selectAllInactive}
                        className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200"
                      >
                        Select All Inactive
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedFollowers.has(follower.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedFollowers.has(follower.id)}
                            onChange={() => toggleFollowerSelection(follower.id)}
                            className="h-4 w-4 text-twitter-blue rounded"
                          />
                          <img
                            src={follower.profileImageUrl}
                            alt={follower.displayName}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <div className="font-semibold">{follower.displayName}</div>
                            <div className="text-sm text-gray-500">@{follower.username}</div>
                            <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                              <span>{follower.followersCount} followers</span>
                              <span>{follower.followingCount} following</span>
                              <span>{follower.tweetCount} tweets</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {follower.isBot && (
                            <span className="flex items-center text-red-600 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Bot
                            </span>
                          )}
                          {follower.isInactive && (
                            <span className="flex items-center text-yellow-600 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Inactive
                            </span>
                          )}
                          {!follower.isBot && !follower.isInactive && (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Active
                            </span>
                          )}
                          <div className={`text-sm font-semibold ${getBotScoreColor(follower.botScore)}`}>
                            {(follower.botScore * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedFollowers.size > 0 && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {selectedFollowers.size} follower(s) selected for removal
                      </span>
                      <button
                        onClick={removeSelectedFollowers}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Analyze Selected
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* CSV Import Modal */}
        {showCSVImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Import Follower Data</h2>
                  <button
                    onClick={() => setShowCSVImport(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <CSVImport onImportComplete={handleCSVImport} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwitterBotCleaner; 
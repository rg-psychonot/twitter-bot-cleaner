import React from 'react';
import { AlertTriangle, CheckCircle, User, Calendar, MessageSquare, Users } from 'lucide-react';

interface FollowerCardProps {
  follower: {
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
  };
  isSelected: boolean;
  onToggleSelection: (followerId: string) => void;
}

const FollowerCard: React.FC<FollowerCardProps> = ({
  follower,
  isSelected,
  onToggleSelection
}) => {
  const getBotScoreColor = (score: number) => {
    if (score > 0.8) return 'text-red-600 bg-red-50';
    if (score > 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = () => {
    if (follower.isBot) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    if (follower.isInactive) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusText = () => {
    if (follower.isBot) return 'Bot';
    if (follower.isInactive) return 'Inactive';
    return 'Active';
  };

  const getStatusColor = () => {
    if (follower.isBot) return 'text-red-600';
    if (follower.isInactive) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAccountAge = () => {
    const created = new Date(follower.createdAt);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      isSelected 
        ? 'border-twitter-blue bg-blue-50 shadow-md' 
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
    }`}>
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(follower.id)}
          className="mt-2 h-4 w-4 text-twitter-blue rounded focus:ring-twitter-blue"
        />

        {/* Profile Image */}
        <img
          src={follower.profileImageUrl}
          alt={follower.displayName}
          className="h-12 w-12 rounded-full border-2 border-gray-200"
        />

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {follower.displayName}
            </h3>
            {getStatusIcon()}
          </div>
          
          <p className="text-sm text-gray-500 mb-2">
            @{follower.username}
          </p>

          {/* Stats Row */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{follower.followersCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{follower.followingCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>{follower.tweetCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{getAccountAge()}</span>
            </div>
          </div>

          {/* Status and Bot Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {follower.lastTweetDate && (
                <span className="text-xs text-gray-500">
                  Last tweet: {formatDate(follower.lastTweetDate)}
                </span>
              )}
            </div>
            
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getBotScoreColor(follower.botScore)}`}>
              {(follower.botScore * 100).toFixed(0)}% bot score
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowerCard; 
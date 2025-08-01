# Twitter Bot Cleaner

A modern web application to identify and remove Twitter bots and inactive accounts from your followers. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🔍 **Bot Detection**: Advanced algorithms to identify bot accounts
- 📊 **Inactivity Analysis**: Detect accounts that haven't tweeted in months
- 🎯 **Smart Filtering**: Filter followers by various criteria
- 📈 **Analytics Dashboard**: View statistics about your follower base
- 🗑️ **Bulk Removal**: Select and remove multiple followers at once
- 🔒 **Secure**: OAuth integration with Twitter API
- 📱 **Responsive**: Works on desktop and mobile devices

## Bot Detection Criteria

The application analyzes followers based on several factors:

- **Account Age**: New accounts with suspicious activity patterns
- **Follower/Following Ratio**: Unusual ratios that indicate bot behavior
- **Tweet Frequency**: Accounts that tweet too frequently or not at all
- **Content Analysis**: Repetitive or automated content patterns
- **Profile Completeness**: Incomplete profiles with default images
- **Last Activity**: Accounts inactive for extended periods

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Twitter Developer Account (for API access)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd twitter-bot-cleaner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_TWITTER_API_KEY=your_twitter_api_key
REACT_APP_TWITTER_API_SECRET=your_twitter_api_secret
REACT_APP_TWITTER_ACCESS_TOKEN=your_access_token
REACT_APP_TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage

1. **Connect to Twitter**: Click the "Connect with Twitter" button to authorize the application
2. **Analyze Followers**: Click "Start Analysis" to scan your followers
3. **Review Results**: Browse through the detected bots and inactive accounts
4. **Select Accounts**: Use checkboxes to select accounts for removal
5. **Bulk Actions**: Use "Select All Bots" or "Select All Inactive" for quick selection
6. **Remove Followers**: Click "Remove Selected" to unfollow the selected accounts

## API Integration

This application integrates with the Twitter API v2 to:

- Fetch follower lists
- Analyze account metadata
- Detect bot patterns
- Remove followers (unfollow)

### Required Twitter API Permissions

- `users.read` - Read user profiles
- `followers.read` - Access follower lists
- `follows.write` - Unfollow users

## Security Features

- OAuth 2.0 authentication
- Secure token storage
- Rate limiting to comply with Twitter API limits
- Data encryption for sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is designed to help clean up your Twitter followers. Please use responsibly and in accordance with Twitter's Terms of Service. The bot detection algorithms are based on common patterns but may not be 100% accurate.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Machine learning-based bot detection
- [ ] Advanced filtering options
- [ ] Export functionality for analysis reports
- [ ] Mobile app version
- [ ] Integration with other social media platforms # Updated for OAuth fix
# Fixed redirect URI
# Force redeploy with correct redirect URI
# Force new deployment
# Fresh deployment Thu Jul 31 23:10:19 CDT 2025
# Force cache refresh Thu Jul 31 23:29:41 CDT 2025

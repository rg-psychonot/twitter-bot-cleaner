import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVImportProps {
  onImportComplete: (followers: any[]) => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const text = await file.text();
      const followers = parseCSV(text);
      onImportComplete(followers);
      setSuccess(true);
    } catch (err) {
      setError('Error processing CSV file. Please check the format.');
      console.error('CSV parsing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const followers: any[] = [];

    // Expected CSV format:
    // username,display_name,profile_image_url,followers_count,following_count,tweet_count,created_at,last_tweet_date,description,verified,protected
    const headers = lines[0]?.split(',').map(h => h.trim()) || [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      if (values.length >= 6) {
        const follower = {
          id: values[0] || `user_${i}`,
          username: values[1] || '',
          displayName: values[2] || '',
          profileImageUrl: values[3] || 'https://via.placeholder.com/48',
          followersCount: parseInt(values[4]) || 0,
          followingCount: parseInt(values[5]) || 0,
          tweetCount: parseInt(values[6]) || 0,
          createdAt: values[7] || '2020-01-01',
          lastTweetDate: values[8] || undefined,
          description: values[9] || '',
          verified: values[10] === 'true',
          protected: values[11] === 'true'
        };
        followers.push(follower);
      }
    }

    return followers;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `username,display_name,profile_image_url,followers_count,following_count,tweet_count,created_at,last_tweet_date,description,verified,protected
john_doe,John Doe,https://example.com/avatar.jpg,150,200,500,2020-01-01,2024-01-15,Real person with thoughts,false,false
bot_account_123,Bot Account,https://example.com/bot.jpg,0,5000,0,2023-01-01,,,false,false
inactive_user,Inactive User,https://example.com/inactive.jpg,10,50,5,2020-01-01,2022-06-15,Old account,false,false`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_followers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <Upload className="h-12 w-12 text-twitter-blue mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Import Follower Data</h2>
        <p className="text-gray-600 mb-4">
          Upload a CSV file with your follower data to analyze for bots and inactive accounts
        </p>
        
        <button
          onClick={downloadSampleCSV}
          className="text-twitter-blue hover:text-blue-600 text-sm underline mb-4"
        >
          Download sample CSV format
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-twitter-blue bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
        
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-twitter-blue"></div>
            <span className="text-gray-600">Processing CSV file...</span>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-twitter-blue hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">CSV file imported successfully!</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to get your follower data:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Use a Twitter data export tool or browser extension</li>
          <li>2. Export your followers list to CSV format</li>
          <li>3. Upload the CSV file here for analysis</li>
          <li>4. The app will analyze each follower for bot patterns</li>
        </ol>
      </div>
    </div>
  );
};

export default CSVImport; 